import axios from 'axios'
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useToast } from '@/composables/useToast'

const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})


// ── Request Interceptor: attach JWT ─────────────────────────
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error),
)

// ── Response Interceptor: handle errors globally ────────────
let isRefreshing = false
let failedQueue: Array<{ resolve: (value: string) => void; reject: (error: unknown) => void }> = []

function processQueue(error: unknown, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error)
        else resolve(token!)
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const { addToast } = useToast()
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // 401: Try to refresh token (but not for auth endpoints themselves)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refresh')

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            const refreshToken = localStorage.getItem('refreshToken')

            if (!refreshToken) {
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers!.Authorization = `Bearer ${token}`
                        return api(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
                const { data } = await axios.post(
                    `${apiBase}/auth/refresh`,
                    { refreshToken },
                )
                const newToken = data.data.accessToken
                localStorage.setItem('accessToken', newToken)
                api.defaults.headers.common.Authorization = `Bearer ${newToken}`
                processQueue(null, newToken)
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.clear()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Handle other errors with toast
        if (error.response?.status !== 401) {
            const data = error.response?.data as { message?: string } | undefined
            const message = data?.message || getDefaultErrorMessage(error.response?.status)

            if (error.response?.status !== 404) {
                addToast({
                    type: 'error',
                    title: 'Error',
                    message,
                    duration: 5000,
                })
            }
        }

        return Promise.reject(error)
    },
)

function getDefaultErrorMessage(status?: number): string {
    switch (status) {
        case 400: return 'Solicitud inválida. Verifica los datos ingresados.'
        case 403: return 'No tienes permisos para realizar esta acción.'
        case 404: return 'Recurso no encontrado.'
        case 422: return 'Los datos proporcionados son inválidos.'
        case 429: return 'Demasiadas solicitudes. Intenta más tarde.'
        case 500: return 'Error del servidor. Intenta más tarde.'
        default: return 'Ocurrió un error inesperado.'
    }
}

export default api
