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
        await api.put(`/peminjaman/${id}`, data);
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/peminjaman/${id}`);
    }
};