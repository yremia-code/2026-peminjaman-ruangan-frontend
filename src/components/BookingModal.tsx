import { useState, useEffect } from "react";
import type { Peminjaman, User, Ruangan } from "../types";
import { userService } from "../api/userService";
import { roomService } from "../api/roomService";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Peminjaman | null;
}

const BookingModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    userId: 0,
    ruanganId: 0,
    tanggalPinjam: "",
    tanggalSelesai: "",
    status: "Pending",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Ruangan[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen && users.length === 0) {
      const fetchOptions = async () => {
        setIsLoadingOptions(true);
        try {
          const [userData, roomData] = await Promise.all([
            userService.getAll(),
            roomService.getAll(),
          ]);
          setUsers(userData);
          setRooms(roomData);
        } catch (err) {
          console.error("Gagal ambil data dropdown", err);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const formatLocalISO = (isoString: string) => {
          if (!isoString) return "";
          const date = new Date(isoString);
          const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000,
          );
          return localDate.toISOString().slice(0, 16);
        };

        setFormData({
          userId: initialData.userId,
          ruanganId: initialData.ruanganId,
          tanggalPinjam: formatLocalISO(initialData.tanggalPinjam),
          tanggalSelesai: formatLocalISO(initialData.tanggalSelesai),
          status: initialData.status,
        });
      } else {
        setFormData({
          userId: 0,
          ruanganId: 0,
          tanggalPinjam: "",
          tanggalSelesai: "",
          status: "Pending",
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.ruanganId) {
      alert("Harap pilih Peminjam dan Ruangan!");
      return;
    }

    if (formData.tanggalSelesai <= formData.tanggalPinjam) {
      alert(
        "⚠️ Waktu Selesai tidak boleh lebih awal atau sama dengan Waktu Mulai!",
      );
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? "✏️ Edit Booking" : "➕ Buat Peminjaman"}</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {isLoadingOptions && (
            <p style={{ fontSize: "0.8rem", color: "#666" }}>
              Memuat data user & ruangan...
            </p>
          )}

          <div className="form-group">
            <label>Peminjam (User)</label>
            <select
              className="filter-select"
              style={{ width: "100%" }}
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: Number(e.target.value) })
              }
              required
            >
              <option value={0}>-- Pilih User --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Ruangan</label>
            <select
              className="filter-select"
              style={{ width: "100%" }}
              value={formData.ruanganId}
              onChange={(e) =>
                setFormData({ ...formData, ruanganId: Number(e.target.value) })
              }
              required
            >
              <option value={0}>-- Pilih Ruangan --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} - {r.gedung}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Mulai Pinjam</label>
            <input
              type="datetime-local"
              className="form-input-modal"
              value={formData.tanggalPinjam}
              onChange={(e) =>
                setFormData({ ...formData, tanggalPinjam: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Selesai Pinjam</label>
            <input
              type="datetime-local"
              className="form-input-modal"
              value={formData.tanggalSelesai}
              onChange={(e) =>
                setFormData({ ...formData, tanggalSelesai: e.target.value })
              }
              required
              min={formData.tanggalPinjam}
            />
            {formData.tanggalPinjam && (
              <small style={{ color: "#666", fontSize: "0.75rem" }}>
                *Harus setelah{" "}
                {new Date(formData.tanggalPinjam).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              className="filter-select"
              style={{ width: "100%" }}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              disabled
            >
              <option value="Pending">⏳ Pending</option>
              <option value="Approved">✅ Approved</option>
              <option value="Rejected">❌ Rejected</option>
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

export default BookingModal;
