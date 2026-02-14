import api from "./axiosInstance";
import type { LoginDTO, AuthResponse } from "../types";

export const authService = {
    login: async (credential: LoginDTO): Promise<AuthResponse> => {
        const response =  await api.post<AuthResponse>('/auth/login', credential);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}