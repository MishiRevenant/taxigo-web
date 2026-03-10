import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import type { User, AuthCredentials, RegisterData } from '@/types'
import { useToast } from '@/composables/useToast'

export const useAuthStore = defineStore(
    'auth',
    () => {
        // ── State ────────────────────────────────────────────────
        const user = ref<User | null>(null)
        const accessToken = ref<string | null>(null)
        const refreshToken = ref<string | null>(null)
        const isLoading = ref(false)

        // ── Computed ─────────────────────────────────────────────
        const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
        const isPassenger = computed(() => user.value?.role === 'passenger')
        const isDriver = computed(() => user.value?.role === 'driver')
        const userRole = computed(() => user.value?.role)

        // ── Actions ──────────────────────────────────────────────
        async function login(credentials: AuthCredentials) {
            const { addToast } = useToast()
            isLoading.value = true
            try {
                const response = await authService.login(credentials)
                setSession(response)
                addToast({ type: 'success', title: '¡Bienvenido!', message: `Hola, ${response.user.name}` })
                return response
            } finally {
                isLoading.value = false
            }
        }

        async function register(userData: RegisterData) {
            const { addToast } = useToast()
            isLoading.value = true
            try {
                const response = await authService.register(userData)
                setSession(response)
                addToast({ type: 'success', title: '¡Cuenta creada!', message: 'Bienvenido a TaxiGo' })
                return response
            } finally {
                isLoading.value = false
            }
        }

        async function logout() {
            if (refreshToken.value) {
                try {
                    await authService.logout(refreshToken.value)
                } catch {
                    // ignore
                }
            }
            clearSession()
        }

        async function fetchMe() {
            if (!accessToken.value) return
            try {
                const fetchedUser = await authService.getMe()
                user.value = fetchedUser
            } catch {
                clearSession()
            }
        }

        function setSession(response: { user: User; tokens: { accessToken: string; refreshToken: string } }) {
            user.value = response.user
            accessToken.value = response.tokens.accessToken
            refreshToken.value = response.tokens.refreshToken
            localStorage.setItem('accessToken', response.tokens.accessToken)
            localStorage.setItem('refreshToken', response.tokens.refreshToken)
        }

        function clearSession() {
            user.value = null
            accessToken.value = null
            refreshToken.value = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        }

        return {
            user,
            accessToken,
            refreshToken,
            isLoading,
            isAuthenticated,
            isPassenger,
            isDriver,
            userRole,
            login,
            register,
            logout,
            fetchMe,
            clearSession,
        }
    },
    {
        persist: {
            paths: ['user', 'accessToken', 'refreshToken'],
        },
    },
)
