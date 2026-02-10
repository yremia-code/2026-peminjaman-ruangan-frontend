import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./AdminLayout.css";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState({ nama: "Admin", role: "Petugas Lab" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          nama: parsed.nama || "Admin",
          role: parsed.role || "Petugas Lab",
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

  const isActive = (path: string) => (location.pathname === path ? "nav-item active" : "nav-item");

  return (
    <div className="admin-wrapper">
      <nav className="navbar-top">
        <div className="navbar-left">
          <div className="brand-spr">SPR ADMIN</div>
          <div className="nav-links">
            <Link to="/admin/dashboard" className={isActive("/admin/dashboard")}>
              <span className="material-symbols-outlined">dashboard</span>Dashboard</Link>
            <Link to="/admin/bookings" className={isActive("/admin/bookings")}>
            <span className="material-symbols-outlined">room_preferences</span>Peminjaman</Link>
            <Link to="/admin/rooms" className={isActive("/admin/rooms")}>
            <span className="material-symbols-outlined">apartment</span>Ruangan</Link>
            <Link to="/admin/users" className={isActive("/admin/users")}>
            <span className="material-symbols-outlined">group</span>Pengguna</Link>
          </div>
        </div>

        <div className="right-nav">
          <div className="status-pill status-online">
            <div className="dot-indicator"></div> Online
          </div>
          <div className="admin-profile-pill">
            <div className="profile-text">
              <div className="name">{user.nama}</div>
              <div className="role">{user.role}</div>
            </div>
            <div className="avatar-circle">{user.nama.charAt(0)}</div>
          </div>
          <button onClick={handleLogout} className="btn-logout-mini" title="Logout"><span className="material-symbols-outlined">logout</span></button>
        </div>
      </nav>

      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;