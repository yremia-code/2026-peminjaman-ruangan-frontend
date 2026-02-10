import { useEffect, useState } from "react";
import { userService } from "../../api/userService";
import type { User } from "../../types";
import UserModal from "../../components/UserModal";
import AdminLayout from "../../layouts/AdminLayout";
import "./UsersPage.css";

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
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

  const handleOpenAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: number) => {
    const userToEdit = users.find((u) => u.id === id);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsModalOpen(true);
    }
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, formData);
        alert("User berhasil diupdate! ✅");
      } else {
        await userService.create(formData);
        alert("User baru berhasil ditambahkan! 🎉");
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan data user ❌. Pastikan password min 6 karakter.");
    }
  };

  const handleDelete = async (id: number, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus user "${nama}"?`)) return;

    try {
      await userService.delete(id);
      alert("User berhasil dihapus!");
      fetchUsers();
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus user. Cek backend.");
    }
  };

  return (
    <AdminLayout>
      <div className="header-row">
        <div>
          <h1 className="page-title">Manajemen Pengguna</h1>
          <p className="page-subtitle">
            Daftar semua pengguna terdaftar di sistem.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-primary" onClick={handleOpenAdd}>
            <span className="material-symbols-outlined">person_add</span>
            Tambah User
          </button>
        </div>
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
        >
          <option value="">Semua Role</option>
          <option value="Admin">Admin</option>
          <option value="Mahasiwa">Mahasiswa</option>
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
                        {user.role === "Admin" ? "🛡️ Admin" : "👤 Mahasiswa"}
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
                          onClick={() => handleEdit(user.id)}
                          title="Edit"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(user.id, user.nama)}
                          title="Hapus"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
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
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingUser}
      />
    </AdminLayout>
  );
};

export default UsersPage;
