import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { bookingService } from "../../api/bookingService";
import type { Peminjaman } from "../../types";
import "./BookingsPage.css";

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Peminjaman[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({
    nama: "Admin",
    role: "Petugas Lab",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const fetchData = useCallback(async (isBackground = false) => {
    setLoading(true);
    try {
      const data = await bookingService.getAll();
      const sortedData = data.sort((a, b) => b.id - a.id);
      setBookings(sortedData);
      setFilteredBookings(sortedData);
    } catch (error) {
      console.error("Gagal ambil data booking", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAdminData({
          nama: parsedUser.nama || "Admin",
          role: parsedUser.role || "Petugas Lab",
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();

    const intervalId = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (!statusFilter && statusParam) {
      setStatusFilter(statusParam);
    }

    let result = bookings;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          (b.user?.nama || "").toLowerCase().includes(lower) ||
          (b.ruangan?.nama || "").toLowerCase().includes(lower),
      );
    }

    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    setFilteredBookings(result);
  }, [bookings, searchParams, searchTerm, statusFilter]);

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
      alert(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui status.",
      );
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
    <div className="bookings-wrapper">
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
      <main className="bookings-content">
        <div className="page-header">
          <div>
            <h1>Daftar Peminjaman</h1>
            <p>Kelola persetujuan peminjaman ruangan.</p>
          </div>

          <button className="btn-primary">
            <span className="material-symbols-outlined">add</span>
            Tambah Ruangan
          </button>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama peminjam atau ruangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            title="Filter berdasarkan status"
            aria-label="Filter berdasarkan status"
          >
            <option value="">Semua Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
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
                        {b.status === "Pending" ? (
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-approve"
                              title="Setujui"
                              onClick={() =>
                                handleStatusChange(b.id, "Approved")
                              }
                            >
                              <span className="material-symbols-outlined">
                                check
                              </span>
                            </button>
                            <button
                              className="btn-action btn-reject"
                              title="Tolak"
                              onClick={() =>
                                handleStatusChange(b.id, "Rejected")
                              }
                            >
                              <span className="material-symbols-outlined">
                                close
                              </span>
                            </button>
                            <button
                              className="btn-action btn-delete"
                              title="Hapus"
                              onClick={() => handleDelete(b.id)}
                            >
                              <span className="material-symbols-outlined">
                                delete
                              </span>
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              textAlign: "right",
                              fontSize: "0.8rem",
                              color: "#94a3b8",
                              fontStyle: "italic",
                              paddingRight: "10px",
                            }}
                          >
                            Selesai
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ textAlign: "center", padding: "3rem" }}
                    >
                      <div style={{ color: "#64748b" }}>
                        Tidak ada data peminjaman.
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

export default BookingsPage;
