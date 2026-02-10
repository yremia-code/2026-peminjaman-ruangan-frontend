import { useEffect, useState } from "react";
import { useSearchParams} from "react-router-dom";
import { roomService } from "../../api/roomService";
import type { Ruangan } from "../../types";
import RoomModal from "../../components/RoomModal";
import AdminLayout from "../../layouts/AdminLayout";
import "./RoomsPage.css";

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Ruangan[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGedung, setSelectedGedung] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Ruangan | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();

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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const gedungParam = searchParams.get("gedung");

    const activeGedung = gedungParam || "";

    if (selectedGedung !== activeGedung) {
      setSelectedGedung(activeGedung);
    }

    let result = rooms;

    if (searchTerm) {
      const lowerKeyword = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.nama.toLowerCase().includes(lowerKeyword) ||
          r.gedung.toLowerCase().includes(lowerKeyword),
      );
    }

    if (activeGedung) {
      result = result.filter((r) => r.gedung === activeGedung);
    }

    setFilteredRooms(result);
  }, [rooms, searchTerm, searchParams]);

  const handleGedungChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;

    if (val) {
      setSearchParams({ gedung: val });
    } else {
      setSearchParams({});
    }
  };

  const handleResetFilter = () => {
    setSearchParams({});
  };

  const uniqueGedung = Array.from(new Set(rooms.map((r) => r.gedung))).sort();
  const handleOpenAdd = () => {
    setEditingRoom(null);
    setIsModalOpen(true);
  };
  const handleOpenEdit = (room: Ruangan) => {
    setEditingRoom(room);
    setIsModalOpen(true);
  };

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
    } catch (error) {
      alert("Gagal menyimpan data ❌");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus ruangan ini?"))
      return;
    try {
      await roomService.delete(id);
      alert("Ruangan berhasil dihapus!");
      fetchData();
    } catch (error) {
      alert("Gagal menghapus ruangan.");
    }
  };

  return (
    <AdminLayout>
      <div className="header-row">
        <div>
          <h1 className="page-title">Manajemen Ruangan</h1>
          <p className="page-subtitle">
            Daftar semua ruangan laboratorium dan kelas.
          </p>
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
          placeholder="Cari nama ruangan atau gedung..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <select
            className="filter-select"
            value={selectedGedung}
            onChange={handleGedungChange}
          >
            <option value="">Semua Gedung</option>
            {uniqueGedung.map((g, idx) => (
              <option key={idx} value={g}>
                {g}
              </option>
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
        <div className="skeleton" style={{ height: "300px" }}></div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Ruangan</th>
                <th>Gedung</th>
                <th>Kapasitas</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
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
                      <div className="room-building">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "22px" }}
                        >
                          apartment
                        </span>{" "}
                        {room.gedung}
                      </div>
                    </td>
                    <td>
                      <span className="capacity-badge">
                        {room.kapasitas} Orang
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleOpenEdit(room)}
                          title="Edit"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "18px" }}
                          >
                            edit
                          </span>
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(room.id)}
                          title="Hapus"
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
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "3rem",
                      color: "#64748b",
                    }}
                  >
                    Tidak ada ruangan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSave}
        initialData={editingRoom}
      />
    </AdminLayout>
  );
};

export default RoomsPage;
