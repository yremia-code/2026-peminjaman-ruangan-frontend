import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { roomService } from "../../api/roomService";
import type { Ruangan } from "../../types";
import RoomModal from "../../components/RoomModal";
import "./RoomsPage.css";

const RoomsPage = () => {
    const [rooms, setRooms] = useState<Ruangan[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Ruangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState({ nama: "Admin", role: "Petugas Lab" });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGedung, setSelectedGedung] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Ruangan | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. Fetch Data User & Rooms
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
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await roomService.getAll();
            setRooms(data);
            setFilteredRooms(data);
        } catch (error) {
            console.error("Gagal ambil data ruangan", error);
        } finally {
            setLoading(false);
        }
    };

    // 2. Logic Filter Utama (Sinkronisasi URL <-> State)
    useEffect(() => {
        const gedungParam = searchParams.get("gedung");

        // --- PERBAIKAN LOGIC DISINI ---
        // Kita paksa state 'selectedGedung' agar SELALU sama dengan URL
        // Jika URL kosong, state juga harus kosong.
        const activeGedung = gedungParam || "";

        if (selectedGedung !== activeGedung) {
            setSelectedGedung(activeGedung);
        }

        let result = rooms;

        // Filter Search
        if (searchTerm) {
            const lowerKeyword = searchTerm.toLowerCase();
            result = result.filter(r =>
                r.nama.toLowerCase().includes(lowerKeyword) ||
                r.gedung.toLowerCase().includes(lowerKeyword)
            );
        }

        // Filter Gedung (Gunakan 'activeGedung' dari URL biar akurat)
        if (activeGedung) {
            result = result.filter(r => r.gedung === activeGedung);
        }

        setFilteredRooms(result);

    }, [rooms, searchTerm, searchParams]); // Hapus 'selectedGedung' dari dependency biar gak loop

    // 3. Handle Dropdown Change -> Update URL
    const handleGedungChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;

        // Cukup update URL, nanti useEffect di atas yang akan mengupdate state & tabel
        if (val) {
            setSearchParams({ gedung: val });
        } else {
            setSearchParams({});
        }
    };

    const handleResetFilter = () => {
        setSearchParams({}); // Kosongkan URL, useEffect akan mereset state & tabel
    };

    const uniqueGedung = Array.from(new Set(rooms.map(r => r.gedung))).sort();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleOpenAdd = () => { setEditingRoom(null); setIsModalOpen(true); };
    const handleOpenEdit = (room: Ruangan) => { setEditingRoom(room); setIsModalOpen(true); };

    const handleSave = async (formData: Omit<Ruangan, "id" | "isDeleted">) => {
        try {
            if (editingRoom) {
                await roomService.update(editingRoom.id, formData);
                alert("Berhasil update ruangan! ✅");
            } else {
                await roomService.create(formData);
                alert("Berhasil tambah ruangan! 🎉");
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) { alert("Gagal menyimpan data ❌"); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus ruangan ini?")) return;
        try {
            await roomService.delete(id);
            alert("Ruangan berhasil dihapus!");
            fetchData();
        } catch (error) { alert("Gagal menghapus ruangan."); }
    };

    return (
        <div className="rooms-wrapper">
            <nav className="navbar-top">
                <div className="navbar-left">
                    <div className="brand-spr">SPR ADMIN</div>
                    <div className="nav-links">
                        <Link to="/admin" className="nav-item">🏠 Dashboard</Link>
                        <Link to="/admin/bookings" className="nav-item">📅 Bookings</Link>
                        <Link to="/admin/rooms" className="nav-item active">🏢 Rooms</Link>
                        <Link to="/admin/users" className="nav-item">👥 Users</Link>
                    </div>
                </div>
                <div className="right-nav">
                    <div className="status-pill status-online"><div className="dot-indicator"></div> Online</div>
                    <div className="admin-profile-pill">
                        <div className="profile-text">
                            <div className="name">{adminData.nama}</div>
                            <div className="role">{adminData.role}</div>
                        </div>
                        <div className="avatar-circle"></div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout-mini">🚪</button>
                </div>
            </nav>

            <main className="rooms-content">

                <div className="page-header">
                    <div>
                        <h1>Manajemen Ruangan</h1>
                        <p>Daftar semua ruangan laboratorium dan kelas.</p>
                    </div>

                    <button className="btn-primary" onClick={handleOpenAdd}>
                        <span className="material-symbols-outlined">add</span>
                        Tambah Ruangan
                    </button>
                </div>

                <div className="filter-bar">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Cari nama ruangan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <select
                            className="filter-select"
                            value={selectedGedung} // Ini akan otomatis berubah karena useEffect
                            onChange={handleGedungChange}
                        >
                            <option value="">Semua Gedung</option>
                            {uniqueGedung.map((g, idx) => (
                                <option key={idx} value={g}>{g}</option>
                            ))}
                        </select>

                        {selectedGedung && (
                            <button
                                className="btn-reset btn-primary"
                                onClick={handleResetFilter}
                                title="Reset Filter"
                            >
                                <span className="material-symbols-outlined">restart_alt</span>
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="skeleton" style={{ height: '300px' }}></div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama Ruangan</th>
                                    <th>Gedung</th>
                                    <th>Kapasitas</th>
                                    <th style={{ textAlign: 'center' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.length > 0 ? (
                                    filteredRooms.map((room) => (
                                        <tr key={room.id}>
                                            <td><div className="room-name">{room.nama}</div></td>
                                            <td><div className="room-building">🏢 {room.gedung}</div></td>
                                            <td><span className="capacity-badge">{room.kapasitas} Orang</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-action btn-edit" onClick={() => handleOpenEdit(room)} title="Edit">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                                    </button>
                                                    <button className="btn-action btn-delete" onClick={() => handleDelete(room.id)} title="Hapus">
                                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            Tidak ada ruangan ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <RoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSave}
                initialData={editingRoom}
            />
        </div>
    );
};

export default RoomsPage;