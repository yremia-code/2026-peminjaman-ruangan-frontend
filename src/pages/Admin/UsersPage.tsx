import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../api/userService";
import type { User } from "../../types";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({
    nama: "Admin",
    role: "Petugas Lab",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setAdminData({
          nama: parsed.nama || "Admin",
          role: parsed.role || "Petugas Lab",
        });
      } catch (e) {
        console.error(e);
      }
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      const sorted = data.sort((a, b) => a.nama.localeCompare(b.nama));
      setUsers(sorted);
      setFilteredUsers(sorted);
    } catch (error) {
      console.error("Gagal ambil data user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.nama.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower),
      );
    }

    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter]);

  const handleEdit = (id: number) => {
    //navigate(`/admin/users/edit/${id}`);
    alert("Fitur edit user belum tersedia.");
  };

  const handleDelete = async (id: number, nama: string) => {
    if (
      !window.confirm(
        `Yakin ingin menghapus user "${nama}"? Data tidak bisa dikembalikan.`,
      )
    )
      return;

    try {
      await userService.delete(id);
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);
      alert("User berhasil dihapus!");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus user. Cek backend.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="users-wrapper">
      <nav className="navbar-top">
        <div className="navbar-left">
          <div className="brand-spr">SPR ADMIN</div>
          <div className="nav-links">
            <Link to="/admin/bookings" className="nav-item">
              📅 Bookings
            </Link>
            <Link to="/admin/rooms" className="nav-item">
              🏢 Rooms
            </Link>
            <Link to="/admin/users" className="nav-item">
              👥 Users
            </Link>
          </div>
        </div>
        <div className="right-nav">
          <div className="status-pill status-online">
            <div className="dot-indicator"></div> Online
          </div>
          <div className="admin-profile-pill">
            <div className="profile-text">
              <div className="name">{adminData.nama}</div>
              <div className="role">{adminData.role}</div>
            </div>
            <div className="avatar-circle"></div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-logout-mini"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </nav>

      <main className="users-content">
        <div className="page-header">
          <div>
            <h1>Manajemen Pengguna</h1>
            <p>Daftar semua pengguna terdaftar di sistem.</p>
          </div>

          <button className="btn-primary" onClick={fetchUsers}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </button>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            title="Filter berdasarkan role"
            aria-label="Filter pengguna berdasarkan role"
          >
            <option value="">Semua Role</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: "300px" }}></div>
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar-initial">
                            {user.nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name-primary">{user.nama}</div>
                            <div className="user-email-secondary">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`role-badge ${user.role === "Admin" ? "role-admin" : "role-user"}`}
                        >
                          {user.role === "Admin" ? "🛡️ Admin" : "👤 User"}
                        </span>
                      </td>

                      <td>
                        <span
                          style={{
                            color: "#16a34a",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          ● Aktif
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-edit"
                            title="Edit User"
                            onClick={() => handleEdit(user.id)}
                          >
                            <span className="material-symbols-outlined">
                              edit
                            </span>
                          </button>
                          <button
                            className="btn-action btn-delete"
                            title="Hapus User"
                            onClick={() => handleDelete(user.id, user.nama)}
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      style={{ textAlign: "center", padding: "3rem" }}
                    >
                      <div style={{ color: "#64748b" }}>
                        Tidak ada user ditemukan.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
