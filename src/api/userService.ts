import api from "./axiosInstance";
import type {User} from "../types";

export const userService = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/user');
        return response.data;
    },

    getById: async (id: number): Promise<User> => {
        const response = await api.get<User>(`/user/${id}`);;
        return response.data;
    },

    create: async (data: Omit<User, 'id' | 'isDeleted'>): Promise<User> => {
        const response = await api.post<User>('/user', { data });
        return response.data;
    },

    update: async (id: number, data: Partial<User>): Promise<void> => {
        await api.put(`/user/${id}`, { data });
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/user/${id}`);
    }
};