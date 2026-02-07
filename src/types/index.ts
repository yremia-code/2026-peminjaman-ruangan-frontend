export interface User {
    id: number;
    nama: string;
    email: string;
    role: string;
    isDeleted: boolean;
}

export interface Ruangan{
    id: number;
    nama: string;
    gedung: string;
    kapasitas: number;
    isDeleted: boolean;
}

export interface Peminjaman{
    id: number;
    userId: number;
    user?: User;
    ruanganId: number;
    ruangan?: Ruangan;
    tanggalMulai: string;
    tanggalSelesai: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}