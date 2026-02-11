import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { roomService } from "../../api/roomService";
import { userService } from "../../api/userService";
import { bookingService } from "../../api/bookingService";
import type { Ruangan, User, Peminjaman } from "../../types";
import RoomModal from "../../components/RoomModal";
import UserModal from "../../components/UserModal";
import BookingModal from "../../components/BookingModal";
import AdminLayout from "../../layouts/AdminLayout";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [room, setRooms] = useState<Ruangan[]>([]);
  const [user, setUsers] = useState<User[]>([]);
  const [booking, setBookings] = useState<Peminjaman[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState({
    nama: "Admin",
    role: "Petugas Lab",
  });

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const [r, u, b] = await Promise.all([
        roomService.getAll(),
        userService.getAll(),
        bookingService.getAll(),
      ]);
      setRooms(r);
      setUsers(u);
      setBookings(b);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data. Periksa koneksi internet.");
    } finally {
      if (!isBackground) setLoading(false);
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

  const groupedRooms = room.reduce(
    (acc, room) => {
      const gedung = room.gedung || "Gedung Lain";
      if (!acc[gedung]) acc[gedung] = [];
      acc[gedung].push(room);
      return acc;
    },
    {} as Record<string, Ruangan[]>,
  );

  const pendingCount = booking.filter((b) => b.status === "Pending").length;
  const approvedCount = booking.filter((b) => b.status === "Approved").length;
  const rejectedCount = booking.filter((b) => b.status === "Rejected").length;

  const handleAddRoom = () => {
    setIsRoomModalOpen(true);
  };

  const handleAddBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleAddUser = () => {
    setIsUserModalOpen(true);
  };

  const handleRoomSaved = async (formData: any) => {
    try {
      await roomService.create(formData);
      alert("Ruangan berhasil ditambahkan! 🎉");
      setIsRoomModalOpen(false);
      fetchData(true);
    } catch (error) {
      alert("Gagal menambah ruangan.");
    }
  };

  const handleUserSaved = async (formData: any) => {
    try {
      await userService.create(formData);
      alert("User berhasil ditambahkan! 🎉");
      setIsUserModalOpen(false);
      fetchData(true);
    } catch (error) {
      alert("Gagal menambah user.");
    }
  };

  const handleBookingSaved = async (formData: any) => {
    try {
      await bookingService.create(formData);
      alert("Peminjaman berhasil ditambahkan! 🎉");
      setIsBookingModalOpen(false);
      fetchData(true);
    } catch (error) {
      alert("Gagal menambah peminjaman.");
    }
  };

  if (loading && room.length === 0)
    return <div className="admin-wrapper">Loading Dashboard...</div>;
  if (error) return <div className="admin-wrapper">{error}</div>;

  return (
    <AdminLayout>
      <header className="header-row">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">
            Selamat datang kembali, {adminData.nama}.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="btn-primary"
            onClick={handleAddBooking}
            style={{ background: "#3b82f6" }}
          >
            + Booking
          </button>
          <button
            className="btn-primary"
            onClick={handleAddUser}
            style={{ background: "#8b5cf6" }}
          >
            + User
          </button>
          <button
            className="btn-primary"
            onClick={handleAddRoom}
            style={{ background: "#10b981" }}
          >
            + Ruangan
          </button>
        </div>
      </header>

      <section className="stats-container">
        <Link to="/admin/bookings" className="stat-card-link">
          <div className="stat-left">
            <div className="stat-icon icon-blue">
              <span className="material-symbols-outlined">event_list</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">Peminjaman</span>
              <span className="stat-value">{booking.length}</span>
            </div>
          </div>
          <div className="arrow-circle">
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </div>
        </Link>
        <Link to="/admin/rooms" className="stat-card-link">
          <div className="stat-left">
            <div className="stat-icon icon-orange">
              <span className="material-symbols-outlined">apartment</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">Ruangan</span>
              <span className="stat-value">{room.length}</span>
            </div>
          </div>
          <div className="arrow-circle">
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </div>
        </Link>
        <Link to="/admin/users" className="stat-card-link">
          <div className="stat-left">
            <div className="stat-icon icon-purple">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total User</span>
              <span className="stat-value">{user.length}</span>
            </div>
          </div>
          <div className="arrow-circle">
            <span className="material-symbols-outlined">
              keyboard_arrow_right
            </span>
          </div>
        </Link>
      </section>

      <section className="section-wrapper">
        <div className="section-header">
          <h3 className="section-title">Gedung & Fasilitas</h3>
          <Link to="/admin/rooms" className="see-all-btn">
            Lihat Detail{" "}
            <span className="arrow-small">
              <span className="material-symbols-outlined">
                keyboard_arrow_right
              </span>
            </span>
          </Link>
        </div>
        <div className="horizontal-scroll-area hide-scrollbar">
          {Object.entries(groupedRooms).map(([gedungName, roomsInGedung]) => (
            <div
              key={gedungName}
              className="summary-card"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/admin/rooms?gedung=${encodeURIComponent(gedungName)}`,
                )
              }
            >
              <div className="card-top">
                <div className="icon-box icon-gray">
                  <span className="material-symbols-outlined">apartment</span>
                </div>
                <div className="card-arrow">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.25rem" }}
                  >
                    arrow_right_alt
                  </span>
                </div>
              </div>
              <div className="card-bottom">
                <h4 className="card-title">{gedungName}</h4>
                <p className="card-desc">{roomsInGedung.length} Ruangan</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-wrapper">
        <div className="section-header">
          <h3 className="section-title">Status Booking</h3>
          <Link to="/admin/bookings" className="see-all-btn">
            Lihat Semua{" "}
            <span className="arrow-small">
              <span className="material-symbols-outlined">
                keyboard_arrow_right
              </span>
            </span>
          </Link>
        </div>
        <div className="horizontal-scroll-area hide-scrollbar">
          <div
            className="summary-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/bookings?status=Pending")}
          >
            <div className="card-top">
              <div className="icon-box icon-orange">
                <span className="material-symbols-outlined">
                  hourglass_bottom
                </span>
              </div>
              <div className="card-arrow">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  arrow_right_alt
                </span>
              </div>
            </div>
            <div className="card-bottom">
              <h4 className="card-title">Pending</h4>
              <p className="card-desc">{pendingCount} Menunggu</p>
            </div>
          </div>

          <div
            className="summary-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/bookings?status=Approved")}
          >
            <div className="card-top">
              <div className="icon-box icon-green">
                <span className="material-symbols-outlined">check_box</span>
              </div>
              <div className="card-arrow">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  arrow_right_alt
                </span>
              </div>
            </div>
            <div className="card-bottom">
              <h4 className="card-title">Approved</h4>
              <p className="card-desc">{approvedCount} Disetujui</p>
            </div>
          </div>

          <div
            className="summary-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/admin/bookings?status=Rejected")}
          >
            <div className="card-top">
              <div className="icon-box icon-red">
                <span className="material-symbols-outlined">cancel</span>
              </div>
              <div className="card-arrow">
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  arrow_right_alt
                </span>
              </div>
            </div>
            <div className="card-bottom">
              <h4 className="card-title">Rejected</h4>
              <p className="card-desc">{rejectedCount} Ditolak</p>
            </div>
          </div>
        </div>
      </section>

      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        onSubmit={handleRoomSaved}
        initialData={null}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSubmit={handleUserSaved}
        initialData={null}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSaved}
        initialData={null}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
