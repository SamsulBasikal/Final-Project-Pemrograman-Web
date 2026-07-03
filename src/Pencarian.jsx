import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Final-Project-Pemrograman-Web/src/layout';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';

const Pencarian = () => {
  const navigate = useNavigate();
  const [kataKunci, setKataKunci] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  
  const [semuaBarang, setSemuaBarang] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    const q = query(collection(db, 'laporan'), orderBy('waktuDibuat', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataDariFirebase = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSemuaBarang(dataDariFirebase);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const hasilFilter = semuaBarang.filter(barang => {
    const nama = barang.namaBarang ? barang.namaBarang.toLowerCase() : '';
    const deskripsi = barang.deskripsi ? barang.deskripsi.toLowerCase() : '';
    const keyword = kataKunci.toLowerCase();

    const cocokKataKunci = nama.includes(keyword) || deskripsi.includes(keyword);
    const cocokStatus = (statusFilter === 'semua') || (barang.status === statusFilter);
    
    return cocokKataKunci && cocokStatus;
  });

  return (
    <Layout>
      <section className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">search_check</span> Cari Barang Hilang / Temuan
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Ketik nama barang atau deskripsi yang dicari..." 
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 rounded-xl border border-gray-300 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary bg-white min-w-[150px] outline-none cursor-pointer"
          >
            <option value="semua">Semua Status</option>
            <option value="hilang">HILANG</option>
            <option value="ditemukan">DITEMUKAN</option>
          </select>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            {loading ? 'Memuat data...' : hasilFilter.length > 0 ? `Menampilkan ${hasilFilter.length} Barang` : '0 Barang Ditemukan'}
          </h3>
        </div>
        
        {loading ? (
           <div className="text-center py-10 text-gray-500 font-bold">Sedang mencari data</div>
        ) : hasilFilter.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hasilFilter.map(barang => {
              const milikSaya = barang.pemilikId === currentUserUid;

              return (
                <div key={barang.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <div className="relative h-44 bg-gray-200 overflow-hidden shrink-0">
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
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">{barang.deskripsi}</p>
                    
                    {/* LOGIKA TOMBOL PINTAR */}
                    {milikSaya ? (
                      <button 
                        disabled
                        className="w-full py-2.5 mt-auto bg-gray-100 text-gray-400 rounded-xl font-bold cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">person</span> Milik Kamu
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/chat/${barang.pemilikId}`, { state: { namaBarang: barang.namaBarang } })}
                        className="w-full py-2.5 mt-auto bg-secondary text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <span className="material-symbols-outlined text-sm">chat</span> Hubungi
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-2">search_off</span>
            <p className="font-semibold text-lg">Barang tidak ditemukan</p>
            <p className="text-sm mt-1">Coba ketik kata kunci lain atau ganti filter statusnya.</p>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Pencarian;