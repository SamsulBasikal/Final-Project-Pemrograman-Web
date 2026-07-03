import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-container font-['Plus_Jakarta_Sans'] overflow-hidden selection:bg-primary selection:text-white">
      
      {/* NAVBAR SIMPLE UNTUK LANDING PAGE */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-4xl font-bold">explore</span>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">TEMORA</h1>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="bg-white/80 backdrop-blur-md text-primary font-bold py-2.5 px-6 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all"
        >
          Masuk
        </button>
      </nav>

      {/* HERO SECTION (BAGIAN UTAMA) */}
      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20">
        
        {/* Efek Latar Belakang (Blurry Blobs) */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-bold text-sm mb-8">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Website Lost & Found 
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Hilang di Sini,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-primary">Temu di Sini.</span>
          </h1>
          
          <p className="mt-4 text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            Jangan panik dulu! TEMORA membantu kamu menemukan kembali barang berharga atau mengembalikan barang temuan ke pemilik aslinya dengan sistem cerdas dan real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Mulai Sekarang <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button 
              onClick={() => navigate('/pencarian')} 
              className="bg-white text-gray-700 font-bold py-4 px-10 rounded-full text-lg shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">search</span> Cari Barang
            </button>
          </div>
        </div>

        {/* FITUR HIGHLIGHT */}
        <div className="relative z-10 mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl border border-white/40 shadow-sm text-left">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary">speed</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lapor Cepat</h3>
            <p className="text-gray-500 text-sm">Unggah foto dan detail barang dalam hitungan detik. Data langsung tersinkronisasi ke seluruh pengguna.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl border border-white/40 shadow-sm text-left">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-purple-600">forum</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-500 text-sm">Hubungi penemu atau pemilik barang secara instan dan aman melalui fitur perpesanan real-time.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-lg p-6 rounded-3xl border border-white/40 shadow-sm text-left">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-yellow-600">verified_user</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aman & Terverifikasi</h3>
            <p className="text-gray-500 text-sm">Sistem login cerdas memastikan setiap pelaporan dapat dipertanggungjawabkan keasliannya.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;