import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { bookingService } from "../../api/bookingService";
import type { Peminjaman } from "../../types";
import BookingModal from "../../components/BookingModal";
import AdminLayout from "../../layouts/AdminLayout";
import "./BookingsPage.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Peminjaman[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Peminjaman | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const data = await bookingService.getAll();
      const sortedData = data.sort((a, b) => b.id - a.id);
      setBookings(sortedData);
      setFilteredBookings(sortedData);
    } catch (error) {
      console.error("Gagal ambil data booking", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(() => {
      fetchData(true);
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    const statusParam = searchParams.get("status");

    const activeStatus = statusParam || "";

    if (statusFilter !== activeStatus) {
      setStatusFilter(activeStatus);
    }

    let result = bookings;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          (b.user?.nama || "").toLowerCase().includes(lower) ||
          (b.ruangan?.nama || "").toLowerCase().includes(lower) ||
          (b.ruangan?.gedung || "").toLowerCase().includes(lower) ||
          (b.user?.email || "").toLowerCase().includes(lower),
      );
    }

    if (activeStatus) {
      result = result.filter((b) => b.status === activeStatus);
    }

    setFilteredBookings(result);
  }, [bookings, searchParams, searchTerm]);

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const val = e.target.value;
    if (val) {
      setSearchParams({ status: val });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilter = () => {
    setSearchParams({});
  };

  const handleOpenAdd = () => {
    setEditingBooking(null);
    setIsModalOpen(true);
  };

  const handleEditDetail = (booking: Peminjaman) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    try {
      if (editingBooking) {
        await bookingService.update(editingBooking.id, formData);
        alert("Booking berhasil diupdate! ✅");
      } else {
        await bookingService.create(formData);
        alert("Booking berhasil dibuat! 🎉");
      }
      fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Error saving booking:", error);
      if (error.response && error.response.data) {
        const backendMessage =
          error.response.data.message ||
          error.response.data.title ||
          "Terjadi kesalahan.";
        alert(`Gagal menyimpan booking: ${backendMessage} ❌`);
      } else {
        alert("Gagal menyimpan data booking. Cek koneksi atau coba lagi. ❌");
      }
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "Approved" | "Rejected",
  ) => {
    const actionText = newStatus === "Approved" ? "menyetujui" : "menolak";
    if (!window.confirm(`Yakin ingin ${actionText} peminjaman ini?`)) return;

    try {
      await bookingService.updateStatus(id, newStatus);
      const updated = bookings.map((b) =>
        b.id === id ? { ...b, status: newStatus } : b,
      );
      setBookings(updated);
      alert(`Berhasil ${actionText} peminjaman!`);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memperbarui status.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus peminjaman ini?"))
      return;
    try {
      await bookingService.delete(id);
      const updatedBookings = bookings.filter((b) => b.id !== id);
      setBookings(updatedBookings);
      alert("Peminjaman berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Gagal menghapus peminjaman.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getStatusClass = (status: string) => {
    if (status === "Approved") return "status-approved";
    if (status === "Rejected") return "status-rejected";
    return "status-pending";
  };

  return (
    <AdminLayout>
      <div className="header-row">
        <div>
          <h1 className="page-title">Daftar Peminjaman</h1>
          <p className="page-subtitle">
            Kelola persetujuan dan jadwal peminjaman ruangan.
          </p>
        </div>

        <button className="btn-primary" onClick={handleOpenAdd}>
          <span className="material-symbols-outlined">add</span>
          Buat Peminjaman
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Cari nama peminjam/email/ruangan/gedung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={handleStatusFilterChange}
          title="Filter Status Peminjaman"
          aria-label="Filter Status Peminjaman"
        >
          <option value="">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        {statusFilter && (
          <button
            className="btn-reset btn-primary"
            onClick={handleResetFilter}
            title="Reset Filter"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: "300px" }}></div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Peminjam</th>
                <th>Ruangan</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar-small">
                          {b.user?.nama?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div className="user-name-text">
                            {b.user?.nama || "Unknown User"}
                          </div>
                          <div className="user-sub-text">{b.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="room-name">
                        {b.ruangan?.nama || "Unknown Room"}
                      </div>
                      <div className="user-sub-text">{b.ruangan?.gedung}</div>
                    </td>
                    <td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "0.85rem",
                        }}
                      >
                        {formatDate(b.tanggalPinjam)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#94a3b8",
                          margin: "2px 0",
                        }}
                      >
                        s/d
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#334155",
                          fontSize: "0.85rem",
                        }}
                      >
                        {formatDate(b.tanggalSelesai)}
                      </div>
                    </td>
                    <td>
                      <div
                        className={`status-badge ${getStatusClass(b.status)}`}
                      >
                        {b.status === "Pending" && (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            hourglass_empty
                          </span>
                        )}
                        {b.status === "Approved" && (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            check_circle
                          </span>
                        )}
                        {b.status === "Rejected" && (
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            cancel
                          </span>
                        )}
                        {b.status}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditDetail(b)}
                          title="Edit Detail"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            edit
                          </span>
                        </button>

                        {b.status !== "Approved" && (
                          <button
                            className="btn-action btn-approve"
                            title="Setujui"
                            onClick={() => handleStatusChange(b.id, "Approved")}
                          >
                            <span className="material-symbols-outlined">
                              check
                            </span>
                          </button>
                        )}

                        {b.status !== "Rejected" && (
                          <button
                            className="btn-action btn-reject"
                            title="Tolak"
                            onClick={() => handleStatusChange(b.id, "Rejected")}
                          >
                            <span className="material-symbols-outlined">
                              close
                            </span>
                          </button>
                        )}

                        <button
                          className="btn-action btn-delete"
                          title="Hapus"
                          onClick={() => handleDelete(b.id)}
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
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    {statusFilter
                      ? `Tidak ada booking dengan status ${statusFilter}.`
                      : "Tidak ada data peminjaman."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingBooking}
      />
    </AdminLayout>
  );
};

export default BookingsPage;
