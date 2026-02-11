import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./UserLayout.css";

interface UserLayoutProps {
  children: ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nama: "Mahasiswa", role: "Mahasiswa" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          nama: parsed.nama || "Mahasiswa",
          role: parsed.role || "Mahasiswa",
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="user-layout-wrapper">
      {/* NAVBAR SIMPEL */}
      <nav className="user-navbar">
        <div className="user-container nav-container">
          <Link to="/user" className="user-brand">
            SPR PENS <span className="brand-tag">Student</span>
          </Link>

          <div className="user-nav-right">
            <div className="user-profile-pill">
              <div className="avatar-circle-user">
                {user.nama.charAt(0).toUpperCase()}
              </div>
              <span className="user-name-text">{user.nama}</span>
            </div>
            
            <button onClick={handleLogout} className="btn-logout-user" title="Keluar">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="user-content user-container">
        {children}
      </main>

      {/* FOOTER SEDERHANA */}
      <footer className="user-footer">
        <p>&copy; 2026 Sistem Peminjaman Ruangan PENS.</p>
      </footer>
    </div>
  );
};

export default UserLayout;