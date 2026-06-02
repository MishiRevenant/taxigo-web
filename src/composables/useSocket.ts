import { ref } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth'
import { useTripStore } from '@/stores/trip'
import { useHistoryStore } from '@/stores/history'
import { useToast } from '@/composables/useToast'
import type { Trip } from '@/types'

let socket: Socket | null = null
const isConnected = ref(false)

/**
 * Global Socket.IO composable.
 * Call `connectSocket()` after login and `disconnectSocket()` on logout.
 * Listens for real-time trip events from the backend and updates stores.
 */
export function useSocket() {
    function connectSocket() {
        // Guard: if a socket already exists (connecting OR connected), don't create another
        if (socket) {
            console.log('[WS] Socket already exists, skipping creation')
            return
        }

        // Lazy-load stores only when connecting (avoids Pinia init issues)
        const authStore = useAuthStore()
        const tripStore = useTripStore()
        const historyStore = useHistoryStore()
        const { addToast } = useToast()

        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
            .replace(/\/api\/?$/, '')

        console.log('[WS] Connecting to:', baseUrl)

        socket = io(baseUrl, {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        socket.on('connect', () => {
            isConnected.value = true
            console.log('[WS] Connected:', socket?.id)

            // Join personal room so we receive trip updates
            if (authStore.user) {
                socket?.emit('join', authStore.user.id)
                console.log('[WS] Joined room user:' + authStore.user.id)
            }

            // Drivers also join the broadcast room for new requests
            if (authStore.isDriver) {
                socket?.emit('join:drivers')
                console.log('[WS] Joined drivers room')
            }
        })

        socket.on('disconnect', (reason) => {
            isConnected.value = false
            console.log('[WS] Disconnected:', reason)
        })

        socket.on('connect_error', (err) => {
            console.warn('[WS] Connection error:', err.message)
            isConnected.value = false
        })

        // ── Trip lifecycle events ─────────────────────────────────────

        // A new trip was requested (broadcast to all drivers)
        socket.on('trip:requested', (trip: Trip) => {
            console.log('[WS] trip:requested', trip.id)
            if (authStore.isDriver) {
                const exists = tripStore.availableTrips.find(t => t.id === trip.id)
                if (!exists) {
                    tripStore.availableTrips.unshift(trip)
                    addToast({ type: 'info', title: 'Nueva solicitud', message: `${trip.originAddress} → ${trip.destinationAddress}` })
                }
            }
        })

        // Trip accepted (sent to the passenger)
        socket.on('trip:accepted', (trip: Trip) => {
            console.log('[WS] trip:accepted', trip.id)
            if (tripStore.currentTrip?.id === trip.id || authStore.user?.id === trip.passengerId) {
                tripStore.currentTrip = trip
                addToast({ type: 'success', title: 'Conductor asignado', message: `${trip.driver?.name || 'Un conductor'} aceptó tu viaje` })
            }
            if (authStore.isDriver) {
                tripStore.availableTrips = tripStore.availableTrips.filter(t => t.id !== trip.id)
            }
        })

        // Trip started (on_ride)
        socket.on('trip:started', (trip: Trip) => {
            console.log('[WS] trip:started', trip.id)
            if (tripStore.currentTrip?.id === trip.id) {
                tripStore.currentTrip = trip
                addToast({ type: 'info', title: 'Viaje iniciado', message: '¡Buen viaje!' })
            }
        })

        // Trip completed
        socket.on('trip:completed', (trip: Trip) => {
            console.log('[WS] trip:completed', trip.id)
            if (tripStore.currentTrip?.id === trip.id) {
                tripStore.currentTrip = trip
                tripStore.stopPolling()
                historyStore.addCompletedTrip(trip)
                addToast({ type: 'success', title: '¡Viaje completado!', message: 'Gracias por usar TaxiGo' })
            }
        })

        // Trip cancelled
        socket.on('trip:cancelled', (trip: Trip) => {
            console.log('[WS] trip:cancelled', trip.id)
            if (tripStore.currentTrip?.id === trip.id) {
                tripStore.currentTrip = trip
                tripStore.stopPolling()
                addToast({ type: 'warning', title: 'Viaje cancelado' })
            }
            if (authStore.isDriver) {
                tripStore.availableTrips = tripStore.availableTrips.filter(t => t.id !== trip.id)
            }
        })

        // Generic update (from PATCH endpoint — fallback)
        socket.on('trip:updated', (trip: Trip) => {
            console.log('[WS] trip:updated', trip.id)
            if (tripStore.currentTrip?.id === trip.id) {
                tripStore.currentTrip = trip
                if (trip.status === 'completed' || trip.status === 'cancelled') {
                    tripStore.stopPolling()
                    if (trip.status === 'completed') historyStore.addCompletedTrip(trip)
                }
            }
        })
    }

    function disconnectSocket() {
        if (socket) {
            socket.removeAllListeners()
            socket.disconnect()
            socket = null
            isConnected.value = false
            console.log('[WS] Disconnected manually')
        }
    }

    return {
        isConnected,
        connectSocket,
        disconnectSocket,
    }
}
