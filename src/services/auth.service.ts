import api from './api'
import type { AuthCredentials, RegisterData, AuthResponse } from '@/types'

export const authService = {
    async login(credentials: AuthCredentials): Promise<AuthResponse> {
        const { data } = await api.post<{ data: AuthResponse }>('/auth/login', credentials)
        return data.data
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        const { data } = await api.post<{ data: AuthResponse }>('/auth/register', userData)
        return data.data
    },

    async logout(refreshToken: string): Promise<void> {
        await api.post('/auth/logout', { refreshToken })
    },

    async getMe() {
        const { data } = await api.get<{ data: { user: AuthResponse['user'] } }>('/auth/me')
        return data.data.user
    },

    async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh', { refreshToken })
        return data.data
    },
}
