import api from "./axiosInstance";
import type { Peminjaman } from "../types";

export const bookingService = {
    getAll: async (): Promise<Peminjaman[]> => {
        const response = await api.get<Peminjaman[]>('/peminjaman');
        return response.data;
    },

    getById: async (id: number): Promise<Peminjaman> => {
        const response = await api.get<Peminjaman>(`/peminjaman/${id}`);
        return response.data;
    },

    create: async (data: Omit<Peminjaman, 'id'>): Promise<Peminjaman> => {
        const response = await api.post<Peminjaman>('/peminjaman', data);
        return response.data;
    },

    update: async (id: number, data: Partial<Peminjaman>): Promise<void> => {
        await api.put(`/peminjaman/${id}`, {id, ...data});
    },

    updateStatus: async (id: number, status: string): Promise<void> => {
        const response = await api.put(
            `/peminjaman/${id}/status`, 
            JSON.stringify(status),
        {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/peminjaman/${id}`);
    }
};