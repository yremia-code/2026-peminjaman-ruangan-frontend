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
    <div className="layout-wrapper">
      {" "}
      {/* SUDAH DIGANTI DARI user-layout-wrapper */}
      <nav className="layout-navbar">
        {" "}
        {/* SUDAH DIGANTI DARI user-navbar */}
        <div
          className="navbar-section"
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          {/* Logo Kiri */}
          <Link to="/user" className="layout-brand">
            SPR PENS <span className="brand-tag">Student</span>
          </Link>

          {/* Menu Kanan */}
          <div className="navbar-section" style={{ gap: "1rem" }}>
            <div className="profile-pill">
              <div className="avatar-circle">
                {user.nama.charAt(0).toUpperCase()}
              </div>
              <div className="profile-info">
                <div className="profile-name">{user.nama}</div>
                <div className="profile-role">{user.role}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="btn-icon-soft"
              title="Keluar"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>
      <main className="layout-container">{children}</main>
      <footer className="user-footer">
        <p>&copy; 2026 Sistem Peminjaman Ruangan PENS.</p>
      </footer>
    </div>
  );
};

export default UserLayout;
