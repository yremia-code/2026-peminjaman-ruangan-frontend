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

  const isActive = (path: string) =>
    location.pathname === path ? "nav-link-item active" : "nav-link-item";

  return (
    <div className="layout-wrapper">
      <nav className="layout-navbar">
        <div className="navbar-section">
          <div className="layout-brand">SPR ADMIN</div>
          <div className="navbar-section" style={{ marginLeft: "2rem" }}>
            <Link
              to="/admin/dashboard"
              className={isActive("/admin/dashboard")}
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
            <Link to="/admin/bookings" className={isActive("/admin/bookings")}>
              <span className="material-symbols-outlined">
                room_preferences
              </span>
              Peminjaman
            </Link>
            <Link to="/admin/rooms" className={isActive("/admin/rooms")}>
              <span className="material-symbols-outlined">apartment</span>
              Ruangan
            </Link>
            <Link to="/admin/users" className={isActive("/admin/users")}>
              <span className="material-symbols-outlined">group</span>Pengguna
            </Link>
          </div>
        </div>
        <div className="navbar-section">
          <div className="status-pill status-online">
            <div className="dot-indicator"></div> Online
          </div>
          <div className="profile-pill">
            <div className="profile-info">
              <div className="profile-name">{user.nama}</div>
              <div className="profile-role">{user.role}</div>
            </div>
            <div className="avatar-circle">{user.nama.charAt(0)}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-icon-soft"
            title="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </nav>
      <main className="layout-container">{children}</main>
    </div>
  );
};

export default AdminLayout;