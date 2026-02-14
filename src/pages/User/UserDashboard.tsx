import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roomService } from "../../api/roomService";
import { bookingService } from "../../api/bookingService";
import type { Ruangan, Peminjaman } from "../../types";
import UserLayout from "../../layouts/UserLayout";
import BookingFormModal from "../../components/BookingFormModal";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [rooms, setRooms] = useState<Ruangan[]>([]);
  const [history, setHistory] = useState<Peminjaman[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Ruangan[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [userId, setUserId] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Ruangan | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserId(user.id);
        fetchData(user.id);
      } catch (e) {
        console.error(e);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchData = async (currentUserId: number) => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        roomService.getAll(),
        bookingService.getAll(),
      ]);

      roomsData.sort((a, b) => a.nama.localeCompare(b.nama));
      setRooms(roomsData);
      setFilteredRooms(roomsData);

      const userHistory = bookingsData
        .filter((b) => b.userId === currentUserId)
        .sort((a, b) => b.id - a.id);

      setHistory(userHistory);
    } catch (error) {
      console.error("Gagal load data", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshHistoryOnly = async () => {
    if (!userId) return;
    try {
      const bookingsData = await bookingService.getAll();
      const userHistory = bookingsData
        .filter((b) => b.userId === userId)
        .sort((a, b) => b.id - a.id);
      setHistory(userHistory);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const result = rooms.filter(
      (r) =>
        r.nama.toLowerCase().includes(lower) ||
        r.gedung.toLowerCase().includes(lower),
    );
    setFilteredRooms(result);
  }, [searchTerm, rooms]);

  const groupedRooms = filteredRooms.reduce(
    (acc, room) => {
      const group = room.gedung || "Lainnya";
      if (!acc[group]) acc[group] = [];
      acc[group].push(room);
      return acc;
    },
    {} as Record<string, Ruangan[]>,
  );

  const handleOpenBooking = (room: Ruangan) => {
    setSelectedRoom(room);
    setIsBookingOpen(true);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    if (status === "Approved")
      return { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" };
    if (status === "Rejected")
      return { bg: "#fef2f2", color: "#dc2626", border: "#fee2e2" };
    return { bg: "#fff7ed", color: "#ea580c", border: "#ffedd5" };
  };

  return (
    <UserLayout>
      <div className="dashboard-grid">
        <div className="main-content">
          <div className="dashboard-header">
            <div>
              <h1 className="user-title">Daftar Ruangan</h1>
              <p className="user-subtitle">
                Silakan pilih ruangan untuk dipinjam.
              </p>
            </div>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input-user"
                placeholder="Cari ruangan atau gedung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="material-symbols-outlined search-icon-user">
                search
              </span>
            </div>
          </div>

          {loading ? (
            <div className="skeleton" style={{ height: "300px" }}></div>
          ) : Object.entries(groupedRooms).length > 0 ? (
            Object.entries(groupedRooms).map(([gedung, roomsInGedung]) => (
              <div key={gedung} className="gedung-section">
                <div className="gedung-title">
                  <span className="material-symbols-outlined">apartment</span>{" "}
                  {gedung}
                </div>

                <div className="room-grid">
                  {roomsInGedung.map((room) => (
                    <div
                      key={room.id}
                      className="dashboard-card room-card-small"
                      onClick={() => handleOpenBooking(room)}
                    >
                      <div className="card-top">
                        <div className="icon-box icon-gray">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1.2rem" }}
                          >
                            meeting_room
                          </span>
                        </div>
                        <span className="capacity-text">
                          {room.kapasitas} Org
                        </span>
                      </div>
                      <div className="card-bottom">
                        <h4 className="card-title">{room.nama}</h4>
                        <div className="card-desc">
                          Pinjam Sekarang{" "}
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "14px" }}
                          >
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-gray)",
              }}
            >
              Tidak ada ruangan ditemukan.
            </div>
          )}
        </div>

        <aside className="history-sidebar">
          <div className="history-header">
            <span className="material-symbols-outlined">history</span> Riwayat
            Peminjaman
          </div>

          <div className="history-list">
            {loading ? (
              <div className="skeleton" style={{ height: "100px" }}></div>
            ) : history.length > 0 ? (
              history.map((h) => {
                const style = getStatusColor(h.status);
                return (
                  <div key={h.id} className="history-item">
                    <div className="h-top">
                      <div className="h-room">
                        {h.ruangan?.nama || "Unknown Room"}
                      </div>
                      <div
                        className="status-badge-mini"
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                          border: `1px solid ${style.border}`,
                        }}
                      >
                        {h.status}
                      </div>
                    </div>
                    <div className="h-date">
                      {formatDate(h.tanggalPinjam)} -{" "}
                      {formatDate(h.tanggalSelesai)}
                    </div>
                  </div>
                );
              })
            ) : (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  color: "var(--text-gray)",
                  marginTop: "1rem",
                }}
              >
                Belum ada riwayat.
              </p>
            )}
          </div>
        </aside>
      </div>

      {userId && (
        <BookingFormModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          room={selectedRoom}
          userId={userId}
          onSuccess={refreshHistoryOnly}
        />
      )}
    </UserLayout>
  );
};

export default UserDashboard;
