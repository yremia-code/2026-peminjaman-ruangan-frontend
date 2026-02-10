import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/authService";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);   

    try {
      const data = await authService.login({ email, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login Berhasil:", data.user.nama);

      if (data.user.role === "Admin" || data.user.role === "Petugas Lab") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user"); 
      }

    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.Message || err.response?.data?.message || "Login Gagal! Periksa email dan password.";
      setError(errorMsg);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-large">SPR PENS</div>
        <p className="brand-desc">
          Sistem Peminjaman Ruangan Politeknik Elektronika Negeri Surabaya.
          Kelola jadwal, fasilitas, dan kegiatan kampus dengan lebih mudah dan terintegrasi.
        </p>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Selamat Datang! 👋</h2>
            <p>Silakan login menggunakan akun Anda.</p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">mail</span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="user@pens.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Sembunyikan" : "Lihat"}
                >
                  <span className="material-symbols-outlined" style={{fontSize: '20px'}}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>refresh</span>
                  Memproses...
                </>
              ) : (
                <>
                  Masuk Sekarang
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-gray)' }}>
            &copy; 2026 SPR PENS. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;