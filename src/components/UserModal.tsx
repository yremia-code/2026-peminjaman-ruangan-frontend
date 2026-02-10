import { useState, useEffect } from "react";
import type { User } from "../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<User, "id" | "isDeleted">) => void;
  initialData?: User | null;
}

const UserModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UserModalProps) => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    role: "Mahasiswa",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nama: initialData.nama,
          email: initialData.email,
          password: initialData.password || "",
          role: initialData.role || "Mahasiswa",
        });
      } else {
        setFormData({ nama: "", email: "", password: "", role: "Mahasiswa" });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? "✏️ Edit User" : "➕ Tambah User"}</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap</label>
            <input
              type="text"
              className="form-input-modal"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
              placeholder="Nama User"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input-modal"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="Email User"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="text"
              className="form-input-modal"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
              placeholder="Password"
            />
            {initialData && (
              <small style={{ color: "#666", marginTop: "4px" }}>
                *Password lama otomatis terisi. Ganti jika ingin merubah.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className="filter-select"
              style={{ width: "100%" }}
            >
              <option value="Mahasiswa">Mahasiswa</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Batal
            </button>
            <button type="submit" className="btn-submit">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
