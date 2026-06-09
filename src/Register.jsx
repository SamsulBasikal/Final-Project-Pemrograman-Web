// file: src/Register.jsx
import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pesan, setPesan] = useState({ text: "", type: "" });

  // Function Daftar Email & Password
  const handleRegisterEmail = async (e) => {
    e.preventDefault();
    setPesan({ text: "", type: "" });

    if (password !== confirmPassword) {
      return setPesan({ text: "Password dan Konfirmasi Password tidak sama!", type: "error" });
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setPesan({ text: "Akun berhasil dibuat! Silakan lanjut ke halaman Login.", type: "success" });
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPesan({ text: `Gagal mendaftar: ${error.message}`, type: "error" });
    }
  };

  // Fungsi Daftar/Login pakai Google
  const handleRegisterGoogle = async () => {
    setPesan({ text: "", type: "" });
    try {
      await signInWithPopup(auth, googleProvider);
      setPesan({ text: "Berhasil masuk dengan Google!", type: "success" });
    } catch (error) {
      setPesan({ text: `Gagal masuk: ${error.message}`, type: "error" });
    }
  };

  // CSS 
  const styles = {
    container: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", fontFamily: "sans-serif" },
    card: { backgroundColor: "white", padding: "40px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px", textAlign: "center" },
    input: { width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "6px", boxSizing: "border-box" },
    btnEmail: { width: "100%", padding: "12px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "10px" },
    btnGoogle: { width: "100%", padding: "12px", backgroundColor: "white", color: "#333", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "16px", marginTop: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
    divider: { margin: "20px 0", color: "#888", fontSize: "14px", display: "flex", alignItems: "center" },
    line: { flex: 1, height: "1px", backgroundColor: "#ccc", margin: "0 10px" },
    msg: { padding: "10px", borderRadius: "5px", marginBottom: "15px", fontSize: "14px", backgroundColor: pesan.type === "error" ? "#fee2e2" : "#dcfce7", color: pesan.type === "error" ? "#991b1b" : "#166534" }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>Buat Akun Baru</h2>
        
        {/* Alert */}
        {pesan.text && <div style={styles.msg}>{pesan.text}</div>}

        {/* Form Email & Password */}
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
      </div>
    </div>
  );
};

export default Register;