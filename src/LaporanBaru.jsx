import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from './firebase';

const LaporanBaru = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    namaBarang: '',
    kategori: 'Aksesoris',
    tanggal: '',
    lokasi: '',
    deskripsi: ''
  });
  
  const [fotoBarang, setFotoBarang] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e) => {
    if (e.target.files[0]) {
      setFotoBarang(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kalau belum login, langsung tendang ke login tanpa alert
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);

    try {
      let fotoUrl = "";

      if (fotoBarang) {
        // ==========================================
        // PLAN A: COBA UPLOAD KE FIREBASE STORAGE
        // ==========================================
        try {
          const namaFileUnik = `${Date.now()}_${fotoBarang.name}`;
          const storageRef = ref(storage, `gambar_laporan/${namaFileUnik}`);
          await uploadBytes(storageRef, fotoBarang);
          fotoUrl = await getDownloadURL(storageRef);
          console.log("Sukses upload foto pakai Firebase");
        } catch (errorFirebase) {
          console.warn("Firebase limit/error! Pindah ke ImgBB...", errorFirebase);
          
          // ==========================================
          // PLAN B: JIKA FIREBASE GAGAL, OTOMATIS KE IMGBB
          // ==========================================
          const formDataImg = new FormData();
          formDataImg.append('image', fotoBarang);

          // PENTING: Ganti dengan API Key ImgBB kamu!
          const response = await fetch('https://api.imgbb.com/1/upload?key=62d695abb8cedfe9fa33e535c6dfdbf8', {
            method: 'POST',
            body: formDataImg
          });
          
          const dataImg = await response.json();
          if (dataImg.success) {
            fotoUrl = dataImg.data.url; 
            console.log("Sukses upload foto pakai ImgBB");
          } else {
            console.error("Gagal upload foto ke ImgBB");
          }
        }
      }

      // ==========================================
      // SIMPAN DATA KE FIRESTORE
      // ==========================================
      await addDoc(collection(db, "laporan"), {
        namaBarang: formData.namaBarang,
        kategori: formData.kategori,
        tanggal: formData.tanggal,
        lokasi: formData.lokasi,
        deskripsi: formData.deskripsi,
        fotoUrl: fotoUrl,
        status: "hilang", 
        pemilikId: auth.currentUser.uid, 
        namaPemilik: auth.currentUser.displayName || auth.currentUser.email, 
        waktuDibuat: serverTimestamp() 
      });

      // Langsung pindah halaman dengan mulus tanpa pop-up
      navigate('/dashboard'); 

    } catch (error) {
      console.error("Gagal nyimpen data: ", error);
      // Alert dihapus biar tidak mengganggu
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">edit_note</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Buat Laporan Baru</h2>
            <p className="text-gray-500 text-sm">Lengkapi formulir di bawah untuk melaporkan barang hilang.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Barang</label>
            <input type="text" name="namaBarang" value={formData.namaBarang} onChange={handleChange} required placeholder="Contoh: Dompet Coach Hitam" className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Kategori</label>
              <select name="kategori" value={formData.kategori} onChange={handleChange} className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white">
                <option value="Aksesoris">Aksesoris</option>
                <option value="Elektronik">Elektronik</option>
                <option value="Kendaraan">Kendaraan</option>
                <option value="Dokumen">Dokumen</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Hilang</label>
              <input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Lokasi Terakhir Terlihat</label>
            <input type="text" name="lokasi" value={formData.lokasi} onChange={handleChange} required placeholder="Contoh: Perpustakaan Lantai 2" className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Foto Barang (Opsional)</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFotoChange} 
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Deskripsi Lengkap & Ciri Khusus</label>
            <textarea rows="4" name="deskripsi" value={formData.deskripsi} onChange={handleChange} required placeholder="Sebutkan ciri khusus (misal: ada goresan di pojok, gantungan kunci merah, dll)" className="w-full p-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 active:scale-95'}`}>
              <span className="material-symbols-outlined">{loading ? 'cloud_upload' : 'send'}</span> 
              {loading ? 'Mengunggah Data...' : 'Publikasikan Laporan'}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
};

export default LaporanBaru;