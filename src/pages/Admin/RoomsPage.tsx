import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { roomService } from "../../api/roomService";
import type { Ruangan } from "../../types";
import "./RoomsPage.css";

const RoomsPage = () => {
    // Data State
    const [rooms, setRooms] = useState<Ruangan[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Ruangan[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminData, setAdminData] = useState({ nama: "Admin", role: "Petugas Lab" });

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGedung, setSelectedGedung] = useState("");
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // 1. Fetch Data
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
        fetchData();
    }, []);

    // 2. Filter Logic
    useEffect(() => {
        const queryParam = searchParams.get("search");
    
        if (!searchTerm && queryParam) {
            setSearchTerm(queryParam);
        }

        let result = rooms;

        // Filter by Text
        if (searchTerm) {
            const lowerKeyword = searchTerm.toLowerCase();
            result = result.filter(r => 
                r.nama.toLowerCase().includes(lowerKeyword) || 
                r.gedung.toLowerCase().includes(lowerKeyword)
            );
        }

        // Filter by Dropdown
        if (selectedGedung) {
            result = result.filter(r => r.gedung === selectedGedung);
        }

        setFilteredRooms(result);

    }, [rooms, searchParams, searchTerm, selectedGedung]);

    const uniqueGedung = Array.from(new Set(rooms.map(r => r.gedung))).sort();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };


    const handleDelete = async (id: number) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus ruangan ini?")) return;

        try {
            await roomService.delete(id);
            
            const updatedRooms = rooms.filter(r => r.id !== id);
            setRooms(updatedRooms);
            
            alert("Ruangan berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus ruangan. Pastikan backend sudah siap.");
        }
    };

    const handleEdit = (id: number) => {
        alert(`Fitur edit untuk ID ${id} akan segera hadir.`);
    };

    return (
        <div className="rooms-wrapper">
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

            <main className="rooms-content">
                <div className="page-header">
                    <div>
                        <h1>Manajemen Ruangan</h1>
                        <p>Daftar semua ruangan laboratorium dan kelas.</p>
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
                        placeholder="Cari nama ruangan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    
                    <select 
                        className="filter-select"
                        value={selectedGedung}
                        onChange={(e) => setSelectedGedung(e.target.value)}
                        title="Filter berdasarkan gedung"
                        aria-label="Filter ruangan berdasarkan gedung"
                    >
                        <option value="">Semua Gedung</option>
                        {uniqueGedung.map((g, idx) => (
                            <option key={idx} value={g}>{g}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="skeleton" style={{height: '300px'}}></div>
                ) : (
                    <div className="table-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama Ruangan</th>
                                    <th>Gedung</th>
                                    <th>Kapasitas</th>
                                    <th style={{textAlign: 'center'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRooms.length > 0 ? (
                                    filteredRooms.map((room) => (
                                        <tr key={room.id}>
                                            <td>
                                                <div className="room-name">{room.nama}</div>
                                            </td>
                                            <td>
                                                <div className="room-building">🏢 {room.gedung}</div>
                                            </td>
                                            <td>
                                                <span className="capacity-badge">{room.kapasitas} Orang</span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-action btn-edit" 
                                                        onClick={() => handleEdit(room.id)}
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined" style={{fontSize: '18px'}}>edit</span>
                                                    </button>
                                                    
                                                    <button 
                                                        className="btn-action btn-delete" 
                                                        onClick={() => handleDelete(room.id)}
                                                        title="Hapus"
                                                    >
                                                        <span className="material-symbols-outlined" style={{fontSize: '18px'}}>delete</span>
                                                    </button>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} style={{textAlign: 'center', padding: '3rem'}}>
                                            <div style={{color: '#64748b'}}>Tidak ada ruangan ditemukan.</div>
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

export default RoomsPage;