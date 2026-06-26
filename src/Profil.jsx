import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';

const Profil = () => {
  const [loadingP, setLoadingP] = useState(false);
  const [profil, setProfil] = useState({
    nama: "Memuat data...",
    username: "memuat",
    kota: "Memuat lokasi...",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
  });

  useEffect(() => {
    const fetchProfil = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setProfil(userSnap.data());
        } else {
          setProfil({
            nama: auth.currentUser.displayName || "User Temora",
            username: auth.currentUser.email ? auth.currentUser.email.split('@')[0] : "user",
            kota: "Belum diatur",
            avatarUrl: auth.currentUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
          });
        }
      }
    };
    fetchProfil();
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
      alert("Mantap! Profil berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal update profil:", error);
      alert("Gagal memperbarui profil.");
    }
  };

  const handleGantiFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingP(true);

    try {
      const namaFileUnik = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `avatar_users/${namaFileUnik}`);
      
      await uploadBytes(storageRef, file);
      
      const fotoBaru = await getDownloadURL(storageRef);

      const dataBaru = { ...profil, avatarUrl: fotoBaru };
      setProfil(dataBaru);

      // --- BARIS PENTING UNTUK UPDATE FOTO DI HEADER ---
      localStorage.setItem('avatarUrl', fotoBaru); 
      // ------------------------------------------------

      await setDoc(doc(db, "users", auth.currentUser.uid), dataBaru, { merge: true });
      alert("Foto profil kamu berhasil diganti! 📸");
      
    } catch (error) {
      console.error("Waduh error:", error);
      alert("Terjadi kesalahan saat mengunggah foto.");
    } finally {
      setLoadingP(false);
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
      
      {/* (Bagian bawah komponen tetap sama seperti sebelumnya) */}
    </Layout>
  );
};

export default Profil;