import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
// HAPUS deleteDoc, GANTI JADI updateDoc
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const Dashboard = () => {
  const navigate = useNavigate();
  const [laporanList, setLaporanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, 'laporan'), orderBy('waktuDibuat', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataDariFirebase = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLaporanList(dataDariFirebase);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChat = (idPemilik, namaBarang) => {
    if (idPemilik === currentUserUid) {
      alert("Ini laporan kamu sendiri lho!");
      return;
    }
    navigate(`/chat/${idPemilik}`, { state: { namaBarang } });
  };

  // LOGIKA BARU: UPDATE STATUS, BUKAN HAPUS DATA
  const handleSelesai = async (idLaporan) => {
    const yakin = window.confirm("Apakah barang ini sudah kembali/selesai? Status akan diubah menjadi 'DITEMUKAN'.");
    if (yakin) {
      try {
        // Kita cuma mengubah field 'status' menjadi 'ditemukan'
        await updateDoc(doc(db, 'laporan', idLaporan), {
          status: 'ditemukan'
        });
        alert("Mantap! Status barang berhasil diperbarui.");
      } catch (error) {
        console.error("Gagal mengupdate laporan:", error);
        alert("Gagal mengubah status laporan.");
      }
    }
  };

  return (
    <Layout>
      {/* BANNER UTAMA */}
      <section className="relative rounded-3xl overflow-hidden mb-8 p-12 md:py-16 flex flex-col items-center text-center bg-gradient-to-br from-blue-700 via-purple-600 to-yellow-600 shadow-xl w-full">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl md:text-[40px] font-extrabold mb-4 leading-tight text-white tracking-tight">
            Hilang di Sini, Temu di Sini.<br/>Selamatkan Barang Berhargamu!
          </h2>
          <button onClick={() => navigate('/laporan-baru')} className="mt-4 bg-[#f9bd22] text-[#261a00] font-bold py-3.5 px-10 rounded-full text-md shadow-lg hover:scale-105 active:scale-95 transition-transform">
            Buat Laporan Sekarang
          </button>
        </div>
      </section>

      {/* LIST BARANG */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Barang Terbaru</h3>
        </div>
        
        {loading ? (
          <div className="text-center py-10 font-bold text-gray-500">Memuat data dari database</div>
        ) : laporanList.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Belum ada laporan barang. Jadilah yang pertama melaporkan!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {laporanList.map((barang) => {
              const milikSaya = barang.pemilikId === currentUserUid;

              return (
                <div key={barang.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-200 flex flex-col">
                  <div className="relative h-44 bg-gray-100 overflow-hidden shrink-0">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={barang.namaBarang} 
                      src={
                        barang.fotoUrl ? barang.fotoUrl :
                        barang.kategori === 'Elektronik' ? "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80" : 
                        barang.kategori === 'Kendaraan' ? "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80" :
                        "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80"
                      }
                    />
                    <div className={`absolute top-3 left-3 text-[10px] font-black px-3 py-1 rounded-full uppercase shadow-lg ${barang.status === 'hilang' ? 'bg-error text-white' : 'bg-green-600 text-white'}`}>
                      {barang.status}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary bg-blue-100 px-2.5 py-0.5 rounded-md">{barang.kategori}</span>
                      <span className="text-xs text-gray-400">{barang.tanggal}</span>
                    </div>
                    <h4 className="font-bold text-lg mb-1">{barang.namaBarang}</h4>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
                      Lokasi: {barang.lokasi} <br/>
                      {barang.deskripsi}
                    </p>
                    
                    {/* LOGIKA TOMBOL YANG SUDAH DIPERBARUI */}
                    {milikSaya ? (
                      barang.status === 'hilang' ? (
                        <button 
                          onClick={() => handleSelesai(barang.id)}
                          className="w-full py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-md mt-auto">
                          <span className="material-symbols-outlined text-sm">check_circle</span> Tandai Selesai
                        </button>
                      ) : (
                        <button 
                          disabled
                          className="w-full py-2.5 bg-gray-100 text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 mt-auto cursor-not-allowed">
                          <span className="material-symbols-outlined text-sm">task_alt</span> Sudah Ditemukan
                        </button>
                      )
                    ) : (
                      <button 
                        onClick={() => handleChat(barang.pemilikId, barang.namaBarang)}
                        className="w-full py-2.5 bg-secondary text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-md mt-auto">
                        <span className="material-symbols-outlined text-sm">chat</span> Hubungi Pelapor
                      </button>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Dashboard;