import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; 

// Import Semua Halaman
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Pencarian from './Pencarian';
import LaporanBaru from './LaporanBaru';
import Profil from './Profil';
import Chat from './Chat';
import Inbox from './Inbox';

// KOMPONEN PROTECTED ROUTE
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-primary">Memeriksa akses</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* UBAH RUTE UTAMA ("/") MENJADI LANDING PAGE */}
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rute Publik (Bisa dilihat tanpa login) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pencarian" element={<Pencarian />} />

        {/* Rute Terproteksi (Wajib Login) */}
        <Route 
          path="/laporan-baru" 
          element={
            <ProtectedRoute>
              <LaporanBaru />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inbox" 
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profil" 
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:userId" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;