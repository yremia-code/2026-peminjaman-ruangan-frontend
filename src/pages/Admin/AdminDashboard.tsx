import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { roomService } from "../../api/roomService";
import { userService } from "../../api/userService";
import { bookingService } from "../../api/bookingService";
import type { Ruangan, User, Peminjaman } from "../../types";
import "./AdminDashboard.css";

const AdminDashboard = () => {
    const [room, setRooms] = useState<Ruangan[]>([]);
    const [user, setUsers] = useState<User[]>([]);
    const [booking, setBookings] = useState<Peminjaman[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [adminData, setAdminData] = useState({ nama: "Admin", role: "Petugas Lab" });
    
    const navigate = useNavigate();

    // 1. FUNGSI FETCH DATA
    const fetchData = useCallback(async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        setError(null);
        try {
            const [r, u, b] = await Promise.all([
                roomService.getAll(),
                userService.getAll(),
                bookingService.getAll()
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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setAdminData({
                    nama: parsedUser.nama || "Admin",
                    role: parsedUser.role || "Petugas Lab"
                });
            } catch (e) { console.error(e); }
        }

        fetchData();

        // 2. AUTO REFRESH TIAP 30 DETIK
        const intervalId = setInterval(() => {
            fetchData(true); 
        }, 30000); 

        return () => clearInterval(intervalId); 
    }, [fetchData]);

    // Data Processing
    const groupedRooms = room.reduce((acc, room) => {
        const gedung = room.gedung || "Gedung Lain";
        if (!acc[gedung]) acc[gedung] = [];
        acc[gedung].push(room);
        return acc;
    }, {} as Record<string, Ruangan[]>);

    const pendingCount = booking.filter(b => b.status === 'Pending').length;
    const approvedCount = booking.filter(b => b.status === 'Approved').length;
    const rejectedCount = booking.filter(b => b.status === 'Rejected').length;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    // A. LOADING SKELETON
    if (loading && room.length === 0) {
        return (
            <div className="admin-wrapper">
                <nav className="navbar-top">
                    <div className="brand-spr">SPR ADMIN</div>
                </nav>
                <main className="dashboard-content">
                    <div className="skeleton" style={{height: 50, width: '40%', marginBottom: 15}}></div>
                    
                    <div className="stats-container">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{height: 80}}></div>)}
                    </div>
                    
                    <div className="section-wrapper">
                        <div className="skeleton" style={{height: 20, width: '20%', marginBottom: 10}}></div>
                        <div className="horizontal-scroll-area hide-scrollbar">
                            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{minWidth: 220, height: '100%'}}></div>)}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // B. ERROR STATE
    if (error) {
        return (
            <div className="admin-wrapper">
                <nav className="navbar-top">
                    <div className="brand-spr">SPR ADMIN</div>
                </nav>
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Oops, Terjadi Kesalahan</h3>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={() => fetchData()}>Coba Lagi</button>
                </div>
            </div>
        );
    }

    // C. DASHBOARD UTAMA
    return (
        <div className="admin-wrapper">
            <nav className="navbar-top">
                <div className="navbar-left">
                    <div className="brand-spr">SPR ADMIN</div>
                    <div className="nav-links">
                        <Link to="/admin/bookings" className="nav-item">📅 Bookings</Link>
                        <Link to="/admin/rooms" className="nav-item">🏢 Rooms</Link>
                        <Link to="/admin/users" className="nav-item">👥 Users</Link>
                    </div>
                </div>
                <div className="right-nav">
                    {/* Menggunakan status-pill universal dari App.css */}
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
                    <button onClick={handleLogout} className="btn-logout-mini" title="Logout">🚪</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <header className="header-row">
                    <div>
                        <h1 className="page-title">Overview</h1>
                        <p className="page-subtitle">Selamat datang kembali, {adminData.nama}.</p>
                    </div>
                    {/* Menggunakan btn-primary universal dari App.css */}
                    <button className="btn-primary">+ Booking</button>
                </header>

                <section className="stats-container">
                    <Link to="/admin/bookings" className="stat-card-link">
                        <div className="stat-left">
                            <div className="stat-icon icon-blue">📅</div>
                            <div className="stat-info"><span className="stat-label">Peminjaman</span><span className="stat-value">{booking.length}</span></div>
                        </div>
                        <div className="arrow-circle">➔</div>
                    </Link>
                    <Link to="/admin/rooms" className="stat-card-link">
                        <div className="stat-left">
                            <div className="stat-icon icon-orange">🏢</div>
                            <div className="stat-info"><span className="stat-label">Ruangan</span><span className="stat-value">{room.length}</span></div>
                        </div>
                        <div className="arrow-circle">➔</div>
                    </Link>
                    <Link to="/admin/users" className="stat-card-link">
                        <div className="stat-left">
                            <div className="stat-icon icon-purple">👥</div>
                            <div className="stat-info"><span className="stat-label">Total User</span><span className="stat-value">{user.length}</span></div>
                        </div>
                        <div className="arrow-circle">➔</div>
                    </Link>
                </section>

                <section className="section-wrapper">
                    <div className="section-header">
                        <h3 className="section-title">Gedung & Fasilitas</h3>
                        <Link to="/admin/rooms" className="see-all-btn">Lihat Semua <span className="arrow-small">➔</span></Link>
                    </div>
                    {/* Menambahkan hide-scrollbar untuk kerapihan */}
                    <div className="horizontal-scroll-area hide-scrollbar">
                        {Object.keys(groupedRooms).length === 0 ? (
                            <div className="empty-state-box">
                                <div className="empty-icon">🏢</div>
                                <div>Belum ada data gedung</div>
                            </div>
                        ) : (
                            Object.entries(groupedRooms).map(([gedungName, roomsInGedung]) => (
                                <div key={gedungName} className="summary-card">
                                    <div className="card-top">
                                        <div className="icon-box icon-gray">🏢</div>
                                        <div className="card-arrow">➔</div>
                                    </div>
                                    <div className="card-bottom">
                                        <h4 className="card-title">{gedungName}</h4>
                                        <p className="card-desc">{roomsInGedung.length} Ruangan</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="section-wrapper">
                    <div className="section-header">
                        <h3 className="section-title">Status Booking</h3>
                        <Link to="/admin/bookings" className="see-all-btn">Lihat Semua <span className="arrow-small">➔</span></Link>
                    </div>
                    <div className="horizontal-scroll-area hide-scrollbar">
                        <div className="summary-card">
                            <div className="card-top"><div className="icon-box icon-orange">⏳</div><div className="card-arrow">➔</div></div>
                            <div className="card-bottom"><h4 className="card-title">Pending</h4><p className="card-desc">{pendingCount} Menunggu</p></div>
                        </div>
                        <div className="summary-card">
                            <div className="card-top"><div className="icon-box icon-green">✅</div><div className="card-arrow">➔</div></div>
                            <div className="card-bottom"><h4 className="card-title">Approved</h4><p className="card-desc">{approvedCount} Disetujui</p></div>
                        </div>
                        <div className="summary-card">
                            <div className="card-top"><div className="icon-box icon-red">✕</div><div className="card-arrow">➔</div></div>
                            <div className="card-bottom"><h4 className="card-title">Rejected</h4><p className="card-desc">{rejectedCount} Ditolak</p></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;