import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Layout from './layout';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

const Chat = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const namaBarang = location.state?.namaBarang || "Barang";

  const [pesanBaru, setPesanBaru] = useState('');
  const [semuaPesan, setSemuaPesan] = useState([]);
  
  const [profilLawan, setProfilLawan] = useState({
    nama: "Memuat...",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
  });
  
  const scrollRef = useRef();
  const currentUserUid = auth.currentUser?.uid;
  const chatId = currentUserUid > userId ? `${currentUserUid}_${userId}` : `${userId}_${currentUserUid}`;

  useEffect(() => {
    const fetchProfilLawan = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfilLawan(userSnap.data());
        } else {
          setProfilLawan({ ...profilLawan, nama: "Pengguna Anonim" });
        }
      } catch (error) {
        console.error("Gagal memuat profil lawan:", error);
      }
    };
    fetchProfilLawan();
  }, [userId]);

  useEffect(() => {
    if (!currentUserUid) return;
    const q = query(collection(db, 'pesan'), where('chatId', '==', chatId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataPesan = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dataPesan.sort((a, b) => (a.waktu?.toMillis() || 0) - (b.waktu?.toMillis() || 0));
      setSemuaPesan(dataPesan);
    });
    return () => unsubscribe();
  }, [chatId, currentUserUid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [semuaPesan]);

  const kirimPesan = async (e) => {
    e.preventDefault();
    if (pesanBaru.trim() === '') return;
    const teksPesan = pesanBaru;
    setPesanBaru('');
    try {
      await addDoc(collection(db, 'pesan'), {
        chatId, pengirimId: currentUserUid, penerimaId: userId, teks: teksPesan, waktu: serverTimestamp()
      });
    } catch (error) {
      console.error("Gagal kirim pesan:", error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 bg-white z-10 shadow-sm">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined text-gray-600">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <img src={profilLawan.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">{profilLawan.nama}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-500">Tanya soal: <span className="font-semibold text-primary">{namaBarang}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col gap-4">
          {semuaPesan.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">
              Belum ada pesan. Sapa {profilLawan.nama} sekarang
            </div>
          ) : (
            semuaPesan.map((pesan) => {
              const pesanSaya = pesan.pengirimId === currentUserUid;
              return (
                <div key={pesan.id} className={`flex ${pesanSaya ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-5 py-3 text-sm shadow-sm ${pesanSaya ? 'bg-primary text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm'}`}>
                    {pesan.teks}
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef}></div>
        </div>

        {/* KOLOM KETIK */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={kirimPesan} className="flex gap-3">
            <input type="text" value={pesanBaru} onChange={(e) => setPesanBaru(e.target.value)} placeholder="Ketik pesan..." className="flex-1 h-12 bg-gray-100 rounded-full px-6 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all border border-transparent" />
            <button type="submit" disabled={pesanBaru.trim() === ''} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${pesanBaru.trim() === '' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-md'}`}>
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
};

export default Chat;