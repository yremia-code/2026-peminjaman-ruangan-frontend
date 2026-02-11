import { useState } from "react";
import { bookingService } from "../api/bookingService";
import type { Ruangan } from "../types";

interface BookingFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: Ruangan | null;
    userId: number;
    onSuccess: () => void;
}

const BookingFormModal = ({ isOpen, onClose, room, userId, onSuccess }: BookingFormModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tanggalPinjam: "",
        jamPinjam: "",
        tanggalSelesai: "",
        jamSelesai: "",
        keperluan: "",
    });

    if (!isOpen || !room) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const startDateTime = `${formData.tanggalPinjam}T${formData.jamPinjam}:00`;
        const endDateTime = `${formData.tanggalSelesai}T${formData.jamSelesai}:00`;

        if (new Date(startDateTime) >= new Date(endDateTime)) {
            alert("Waktu selesai harus lebih besar dari waktu mulai!");
            setLoading(false);
            return;
        }

        const payload = {
            userId: userId,
            ruanganId: room.id,
            tanggalPinjam: startDateTime,
            tanggalSelesai: endDateTime,
            keperluan: formData.keperluan,
            status: "Pending" as "Pending",
        };

        try {
            await bookingService.create(payload);
            alert(`Berhasil mengajukan peminjaman untuk ${room.nama}! 🎉`);

            setFormData({
                tanggalPinjam: "", jamPinjam: "", tanggalSelesai: "", jamSelesai: "", keperluan: ""
            });

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Gagal mengajukan peminjaman.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Pinjam {room.nama}</h3>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tanggal Mulai</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input type="date" required className="form-input"
                                value={formData.tanggalPinjam}
                                onChange={(e) => setFormData({ ...formData, tanggalPinjam: e.target.value })}
                            />
                            <input type="time" required className="form-input"
                                value={formData.jamPinjam}
                                onChange={(e) => setFormData({ ...formData, jamPinjam: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Tanggal Selesai</label>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <input type="date" required className="form-input"
                                value={formData.tanggalSelesai}
                                onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                            />
                            <input type="time" required className="form-input"
                                value={formData.jamSelesai}
                                onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? "Mengirim..." : "Kirim Pengajuan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingFormModal;