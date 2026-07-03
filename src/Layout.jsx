import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebase'; 

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;

  // States
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState([]);

  useEffect(() => {
    // 1. Minta Izin Notifikasi OS
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        
        // --- FITUR A: PANTAU FOTO PROFIL ---
        const userRef = doc(db, 'users', user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().avatarUrl) {
            setAvatar(docSnap.data().avatarUrl); 
          } else if (user.photoURL) {
            setAvatar(user.photoURL); 
          }
        });

        // --- FITUR B: PANTAU CHAT UNTUK NOTIFIKASI OS & RIWAYAT LONCENG ---
        const qPesan = query(collection(db, 'pesan'), where('penerimaId', '==', user.uid));
        const unsubscribePesan = onSnapshot(qPesan, (snapshot) => {
          
          // Bagian 1: Untuk Notifikasi OS (Muncul di luar browser)
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const dataPesan = change.doc.data();
              if (dataPesan.waktu && (Date.now() - dataPesan.waktu.toMillis() < 10000)) {
                if (Notification.permission === 'granted') {
                  new Notification("📩 Pesan Baru di TEMORA", {
                    body: dataPesan.teks,
                    icon: "/favicon.svg" 
                  });
                }
              }
            }
          });

          // Bagian 2: Untuk Riwayat Dropdown Lonceng (In-App)
          const semuaNotif = [];
          snapshot.docs.forEach(doc => {
             semuaNotif.push({ id: doc.id, ...doc.data() });
          });
          
          // Urutkan dari yang paling baru
          semuaNotif.sort((a, b) => {
             const waktuA = a.waktu ? a.waktu.toMillis() : 0;
             const waktuB = b.waktu ? b.waktu.toMillis() : 0;
             return waktuB - waktuA;
          });
          
          // Ambil 5 riwayat terbaru saja biar dropdown tidak kepanjangan
          setNotifList(semuaNotif.slice(0, 5));
        });
        
        return () => {
          unsubscribeDoc();
          unsubscribePesan(); 
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <div className="bg-surface-container text-on-surface min-h-screen pb-24 font-['Plus_Jakarta_Sans']">
      
      {/* HEADER ATAS */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl font-bold">explore</span>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">TEMORA</h1>
        </div>
        
        {/* WADAH LONCENG & PROFIL */}
        <div className="flex items-center gap-4">
          
          {/* TOMBOL LONCENG NOTIFIKASI */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center text-gray-600"
            >
              <span className="material-symbols-outlined">notifications</span>
              {/* Badge Angka Merah jika ada notif */}
              {notifList.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {notifList.length}
                </span>
              )}
            </button>

            {/* DROPDOWN MENU NOTIFIKASI */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100]">
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-800">Notifikasi</h3>
                  <span className="text-xs bg-blue-100 text-primary font-bold px-2 py-1 rounded-md">{notifList.length} Baru</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifList.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Belum ada notifikasi baru.</div>
                  ) : (
                    notifList.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          setIsNotifOpen(false);
                          navigate('/inbox'); // Kalau diklik, pindah ke Inbox
                        }}
                        className="p-4 border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors flex gap-3 items-start"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-primary text-xl">chat</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 mb-0.5">Pesan Chat Baru</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{notif.teks}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div 
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/inbox');
                  }}
                  className="p-3 text-center text-sm font-bold text-primary hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  Lihat Semua Pesan
                </div>
              </div>
            )}
          </div>

          {/* FOTO PROFIL */}
          <Link 
            to="/profil" 
            className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center overflow-hidden border-2 border-primary hover:scale-105 transition-transform cursor-pointer shadow-sm"
            title="Ke Halaman Profil"
          >
            <img alt="Profile" className="w-full h-full object-cover" src={avatar} />
          </Link>
        </div>
      </header>

      {/* NAVBAR SAMPING (DESKTOP) */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-72 py-8 bg-surface-container-low border-r border-outline-variant shadow-lg z-40">
        <div className="px-6 mb-8 pt-12"><h2 className="text-2xl font-bold text-primary">TEMORA</h2></div>
        <div className="flex flex-col gap-2">
          <Link to="/dashboard" className={`px-6 py-3 rounded-r-full mr-4 flex items-center gap-4 font-semibold transition-all ${isActive('/dashboard') ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}`}>
            <span className="material-symbols-outlined">home</span> Home
          </Link>
          <Link to="/pencarian" className={`px-6 py-3 rounded-r-full mr-4 flex items-center gap-4 font-semibold transition-all ${isActive('/pencarian') ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}`}>
            <span className="material-symbols-outlined">search</span> Pencarian
          </Link>
          <Link to="/laporan-baru" className={`px-6 py-3 rounded-r-full mr-4 flex items-center gap-4 font-semibold transition-all ${isActive('/laporan-baru') ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}`}>
            <span className="material-symbols-outlined">add_box</span> Laporan Baru
          </Link>
          <Link to="/inbox" className={`px-6 py-3 rounded-r-full mr-4 flex items-center gap-4 font-semibold transition-all ${isActive('/inbox') ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}`}>
            <span className="material-symbols-outlined">forum</span> Pesan
          </Link>
          <Link to="/profil" className={`px-6 py-3 rounded-r-full mr-4 flex items-center gap-4 font-semibold transition-all ${isActive('/profil') ? 'bg-blue-100 text-primary' : 'text-gray-600 hover:bg-blue-50'}`}>
            <span className="material-symbols-outlined">account_circle</span> Profil
          </Link>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="pt-24 px-4 md:ml-80 max-w-[1020px] min-h-screen">
        {children}
      </main>

      {/* NAVBAR BAWAH (MOBILE) */}
      <nav className="fixed bottom-0 w-full z-[100] bg-white/90 backdrop-blur-xl flex justify-around items-center px-4 py-3 md:hidden rounded-t-3xl shadow-lg border-t border-outline-variant/30">
        <Link to="/dashboard" className={`flex flex-col items-center ${isActive('/dashboard') ? 'text-primary' : 'text-gray-400'}`}><span className="material-symbols-outlined">home</span></Link>
        <Link to="/pencarian" className={`flex flex-col items-center ${isActive('/pencarian') ? 'text-primary' : 'text-gray-400'}`}><span className="material-symbols-outlined">search</span></Link>
        <Link to="/laporan-baru" className={`flex flex-col items-center ${isActive('/laporan-baru') ? 'text-primary' : 'text-gray-400'}`}><span className="material-symbols-outlined">add_circle</span></Link>
        <Link to="/inbox" className={`flex flex-col items-center ${isActive('/inbox') ? 'text-primary' : 'text-gray-400'}`}><span className="material-symbols-outlined">forum</span></Link>
        <Link to="/profil" className={`flex flex-col items-center ${isActive('/profil') ? 'text-primary' : 'text-gray-400'}`}><span className="material-symbols-outlined">person</span></Link>
      </nav>

    </div>
  );
};

export default Layout;