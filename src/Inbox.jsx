import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import { collection, onSnapshot, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';

const Inbox = () => {
  const navigate = useNavigate();
  const [daftarChat, setDaftarChat] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserUid = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserUid) return;

    const q = query(collection(db, 'pesan'), orderBy('waktu', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const pesanTerkait = [];
      const chatRoomsUnik = new Set();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.pengirimId === currentUserUid || data.penerimaId === currentUserUid) {
          if (!chatRoomsUnik.has(data.chatId)) {
            chatRoomsUnik.add(data.chatId);
            pesanTerkait.push({ id: doc.id, ...data });
          }
        }
      });

      const chatDenganProfil = await Promise.all(pesanTerkait.map(async (pesan) => {
        const idLawan = pesan.pengirimId === currentUserUid ? pesan.penerimaId : pesan.pengirimId;
        let profilLawan = { nama: "Pengguna Anonim", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" };
        
        try {
          const userSnap = await getDoc(doc(db, 'users', idLawan));
          if (userSnap.exists()) profilLawan = userSnap.data();
        } catch (error) {
          console.error("Gagal ambil profil lawan", error);
        }

        return { ...pesan, idLawan, profilLawan };
      }));

      setDaftarChat(chatDenganProfil);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserUid]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden min-h-[70vh]">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">forum</span>
          <h2 className="text-2xl font-bold text-gray-900">Kotak Masuk</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-12 text-gray-500 font-medium">Memuat pesan</div>
          ) : daftarChat.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-3">chat_bubble_outline</span>
              <p className="text-gray-500 text-lg">Belum ada obrolan.</p>
            </div>
          ) : (
            daftarChat.map((chat) => (
              <div 
                key={chat.chatId} 
                onClick={() => navigate(`/chat/${chat.idLawan}`)}
                className="p-5 flex items-center gap-4 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <img src={chat.profilLawan.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-gray-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg truncate">{chat.profilLawan.nama}</h4>
                  <p className="text-gray-500 text-sm truncate mt-0.5">
                    {chat.pengirimId === currentUserUid ? "Anda: " : ""} 
                    {chat.teks}
                  </p>
                </div>
                <div className="shrink-0 text-xs text-gray-400 font-medium">
                  {chat.waktu ? new Date(chat.waktu.toDate()).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Inbox;