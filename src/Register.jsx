import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pesan, setPesan] = useState({ text: "", type: "" });
  
  const navigate = useNavigate();

  const handleRegisterEmail = async (e) => {
    e.preventDefault();
    setPesan({ text: "", type: "" });

    if (password !== confirmPassword) {
      return setPesan({ text: "Password dan Konfirmasi Password tidak sama", type: "error" });
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPesan({ text: "Akun berhasil dibuat Mengalihkan ke halaman Login...", type: "success" });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      setPesan({ text: `Gagal mendaftar: ${error.message}`, type: "error" });
    }
  };

  const handleRegisterGoogle = async () => {
    setPesan({ text: "", type: "" });
    try {
      await signInWithPopup(auth, googleProvider);
      setPesan({ text: "Berhasil masuk dengan Google", type: "success" });
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      setPesan({ text: `Gagal masuk: ${error.message}`, type: "error" });
    }
  };

  const styles = {
    container: { 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
      padding: "20px",
      fontFamily: "'Inter', sans-serif"
    },
    card: { 
      backgroundColor: "white", 
      padding: "45px 40px", 
      borderRadius: "15px", 
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)", 
      width: "100%", 
      maxWidth: "400px", 
      textAlign: "center" 
    },
    input: { 
      width: "100%", 
      padding: "14px", 
      margin: "10px 0", 
      border: "1px solid #e2e8f0", 
      borderRadius: "8px", 
      boxSizing: "border-box",
      backgroundColor: "#f8fafc",
      color: "#333",
      fontSize: "14px",
      outline: "none"
    },
    btnEmail: { 
      width: "100%", 
      padding: "14px", 
      backgroundColor: "#3b82f6", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontWeight: "bold", 
      fontSize: "16px", 
      marginTop: "15px",
      transition: "0.3s"
    },
    btnGoogle: { 
      width: "100%", 
      padding: "12px", 
      backgroundColor: "white", 
      color: "#475569", 
      border: "1px solid #cbd5e1", 
      borderRadius: "8px", 
      cursor: "pointer", 
      fontWeight: "bold", 
      fontSize: "15px", 
      marginTop: "15px", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      gap: "10px",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },
    divider: { 
      margin: "25px 0", 
      color: "#94a3b8", 
      fontSize: "14px", 
      display: "flex", 
      alignItems: "center" 
    },
    line: { 
      flex: 1, 
      height: "1px", 
      backgroundColor: "#e2e8f0", 
      margin: "0 10px" 
    },
    msg: { 
      padding: "12px", 
      borderRadius: "8px", 
      marginBottom: "20px", 
      fontSize: "14px", 
      backgroundColor: pesan.type === "error" ? "#fee2e2" : "#dcfce7", 
      color: pesan.type === "error" ? "#991b1b" : "#166534",
      fontWeight: "500"
    },
    linkText: { 
      marginTop: "25px", 
      fontSize: "14px", 
      color: "#64748b" 
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px", color: "#333", fontWeight: "800" }}>Buat Akun Baru</h2>
        
        {pesan.text && <div style={styles.msg}>{pesan.text}</div>}

        <form onSubmit={handleRegisterEmail}>
          <input type="email" placeholder="Masukkan Email" style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min. 6 karakter)" style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input type="password" placeholder="Konfirmasi Password" style={styles.input} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          
          <button type="submit" style={styles.btnEmail}>Daftar</button>
        </form>

        <div style={styles.divider}>
          <div style={styles.line}></div>
          <span>ATAU</span>
          <div style={styles.line}></div>
        </div>

        <button onClick={handleRegisterGoogle} style={styles.btnGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" style={{ width: "20px" }} />
          Daftar dengan Google
        </button>

        <p style={styles.linkText}>
          Sudah punya akun? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "bold" }}>Masuk di sini</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;