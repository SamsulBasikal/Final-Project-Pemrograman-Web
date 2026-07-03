import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccessMsg('Berhasil masuk! Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      setErrorMsg('Gagal masuk: ' + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMsg('Berhasil masuk dengan Google! Mengalihkan...');
      // Tunggu 1 detik lalu pindah ke Dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      setErrorMsg('Gagal masuk: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700 p-4 font-['Plus_Jakarta_Sans']">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        
        {successMsg && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan Email" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password" 
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            Masuk
          </button>
        </form>

        <div className="my-6 flex items-center justify-center gap-3">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-gray-400 text-xs font-semibold tracking-wider">ATAU</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Masuk dengan Google
        </button>

        <p className="text-center text-sm text-gray-600 mt-6">
          Belum punya akun? <Link to="/register" className="text-blue-600 font-bold hover:underline">Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;