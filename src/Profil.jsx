import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // TAMBAHAN 1: Untuk pindah halaman
import Layout from './Layout';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth'; // TAMBAHAN 2: Fungsi bawaan Firebase untuk logout
import { auth, db, storage } from './firebase'; 

const Profil = () => {
  const navigate = useNavigate(); // Inisialisasi navigasi
  const [loadingP, setLoadingP] = useState(false);
  const [profil, setProfil] = useState({
    nama: "Memuat data...",
    username: "memuat",
    kota: "Memuat lokasi...",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  });

  const [statistik, setStatistik] = useState({
    totalLaporan: 0,
    barangTemu: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        // 1. Ambil Data Profil
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfil(userSnap.data());
        } else {
          setProfil({
            nama: auth.currentUser.displayName || "User Temora",
            username: auth.currentUser.email?.split('@')[0] || "user",
            kota: "Belum diatur",
            avatarUrl: auth.currentUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
          });
        }

        // 2. Hitung Jumlah Laporan Asli dari Database
        try {
          const qLaporan = query(collection(db, 'laporan'), where('pemilikId', '==', auth.currentUser.uid));
          const snapLaporan = await getDocs(qLaporan);
          
          let hitungTotal = snapLaporan.size;
          let hitungTemu = 0;

          snapLaporan.forEach((doc) => {
            if (doc.data().status === 'ditemukan') {
              hitungTemu++;
            }
          });

          setStatistik({
            totalLaporan: hitungTotal,
            barangTemu: hitungTemu
          });
        } catch (error) {
          console.error("Gagal menghitung statistik laporan:", error);
        }
      }
    };
    fetchData();
  }, []);

  const handleEditProfil = async () => {
    const namaBaru = prompt("Nama Lengkap Baru:", profil.nama);
    if (!namaBaru) return;
    const kotaBaru = prompt("Lokasi/Kota Baru:", profil.kota);
    if (!kotaBaru) return;
    
    const dataBaru = { ...profil, nama: namaBaru, kota: kotaBaru };
    setProfil(dataBaru);

    try {
      await setDoc(doc(db, "users", auth.currentUser.uid), dataBaru, { merge: true });
    } catch (error) {
      console.error("Gagal update profil:", error);
    }
  };

  const handleGantiFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingP(true);

    try {
      let fotoBaru = "";

      try {
        const namaFileUnik = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `avatar_users/${namaFileUnik}`);
        await uploadBytes(storageRef, file);
        fotoBaru = await getDownloadURL(storageRef);
      } catch (errorFirebase) {
        console.warn("Firebase limit/error! Pindah ke ImgBB...", errorFirebase);

        const formDataImg = new FormData();
        formDataImg.append('image', file);

        const response = await fetch('https://api.imgbb.com/1/upload?key=62d695abb8cedfe9fa33e535c6dfdbf8', {
          method: 'POST',
          body: formDataImg
        });
        
        const dataImg = await response.json();
        if (dataImg.success) {
          fotoBaru = dataImg.data.url; 
        } else {
          throw new Error("Dua-duanya gagal (Firebase & ImgBB)");
        }
      }

      if (fotoBaru !== "") {
        const dataBaru = { ...profil, avatarUrl: fotoBaru };
        setProfil(dataBaru);
        await setDoc(doc(db, "users", auth.currentUser.uid), dataBaru, { merge: true });
      }

    } catch (error) {
      console.error("Waduh error:", error);
    } finally {
      setLoadingP(false);
    }
  };

  // FUNGSI BARU UNTUK LOGOUT
  const handleLogout = async () => {
    const konfirmasi = window.confirm("Apakah kamu yakin ingin keluar dari TEMORA?");
    if (konfirmasi) {
      try {
        await signOut(auth);
        navigate('/'); // Melempar user kembali ke Landing Page setelah berhasil logout
      } catch (error) {
        console.error("Gagal logout:", error);
        alert("Terjadi kesalahan saat mencoba keluar.");
      }
    }
  };

  return (
    <Layout>
      <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8 relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <button onClick={handleEditProfil} className="absolute top-4 right-4 bg-white/20 text-white backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/30 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">edit</span> Edit Teks
          </button>
        </div>

        <div className="px-8 pb-8 relative">
          <div className="relative w-32 h-32 -mt-16 mb-6 group cursor-pointer">
            <input type="file" onChange={handleGantiFoto} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" disabled={loadingP} />
            <div className="w-full h-full rounded-3xl border-4 border-white bg-gray-200 overflow-hidden shadow-md relative z-10 flex items-center justify-center">
              {loadingP ? (
                 <span className="material-symbols-outlined animate-spin text-gray-400">autorenew</span>
              ) : (
                 <img className="w-full h-full object-cover transition-all" src={profil.avatarUrl} alt="Avatar" />
              )}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-3xl z-10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center pointer-events-none">
              <span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{profil.nama}</h2>
          <p className="text-gray-500 font-medium">@{profil.username} • {profil.kota}</p>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-3xl font-black text-primary">{statistik.totalLaporan}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Laporan Saya</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-3xl font-black text-green-600">{statistik.barangTemu}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Barang Temu</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center col-span-2 md:col-span-1">
          <p className="text-3xl font-black text-secondary">Aktif</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status Akun</p>
        </div>
      </div>

      {/* TOMBOL LOGOUT BARU */}
      <div className="flex justify-center mt-2 mb-10">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-50 text-red-600 font-bold py-3 px-8 rounded-full hover:bg-red-100 active:scale-95 transition-all shadow-sm border border-red-100"
        >
          <span className="material-symbols-outlined">logout</span>
          Keluar Akun
        </button>
      </div>

    </Layout>
  );
};

export default Profil;