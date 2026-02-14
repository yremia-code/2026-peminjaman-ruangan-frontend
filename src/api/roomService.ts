import api from "./axiosInstance";
import type { Ruangan } from "../types";

export const roomService = {
    getAll: async (): Promise<Ruangan[]> => {
        const response = await api.get<Ruangan[]>('/ruangan');
        return response.data;
    },

    getById: async (id: number): Promise<Ruangan> => {
        const response = await api.get<Ruangan>(`/ruangan/${id}`);
        return response.data;
    },

    create: async (data: Omit<Ruangan, 'id' | 'isDeleted'>): Promise<Ruangan> => {
        const response = await api.post<Ruangan>('/ruangan',  data );
        return response.data;
    },

    update: async (id: number, data: Partial<Ruangan>): Promise<void> => {
        await api.put(`/ruangan/${id}`,  {id, ...data} );
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/ruangan/${id}`);
    }
}