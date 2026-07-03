import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-surface-container text-on-surface min-h-screen pb-24 font-['Plus_Jakarta_Sans']">
      
      {/* HEADER ATAS */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl font-bold">explore</span>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">TEMORA</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center overflow-hidden border-2 border-primary">
          <img alt="Profile" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" />
        </div>
      </header>

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