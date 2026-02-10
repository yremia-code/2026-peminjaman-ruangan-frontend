import { useState, useEffect } from "react";
import type { Ruangan } from "../types";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Ruangan, "id" | "isDeleted">) => void;
  initialData?: Ruangan | null;
}

const RoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: RoomModalProps) => {
  const [formData, setFormData] = useState({
    nama: "",
    gedung: "",
    kapasitas: 0,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nama: initialData.nama,
          gedung: initialData.gedung,
          kapasitas: initialData.kapasitas,
        });
      } else {
        setFormData({ nama: "", gedung: "", kapasitas: 0 });
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
          <h2>{initialData ? "✏️ Edit Ruangan" : "➕ Tambah Ruangan"}</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Ruangan</label>
            <input
              type="text"
              className="form-input-modal"
              placeholder="Contoh: Lab Komputer 1"
              value={formData.nama}
              onChange={(e) =>
                setFormData({ ...formData, nama: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Gedung</label>
            <input
              type="text"
              className="form-input-modal"
              placeholder="Contoh: D4"
              value={formData.gedung}
              onChange={(e) =>
                setFormData({ ...formData, gedung: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Kapasitas (Orang)</label>
            <input
              type="number"
              min="1"
              className="form-input-modal"
              value={formData.kapasitas}
              onChange={(e) =>
                setFormData({ ...formData, kapasitas: Number(e.target.value) })
              }
              required
            />
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

export default RoomModal;
