import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tripService } from '@/services/trip.service'
import type { Trip, RequestTripData } from '@/types'
import { useToast } from '@/composables/useToast'

export const useTripStore = defineStore('trip', () => {
    // ── State ──────────────────────────────────────────────────
    const currentTrip = ref<Trip | null>(null)
    const availableTrips = ref<Trip[]>([])
    const isLoading = ref(false)
    const isPolling = ref(false)

    let pollInterval: ReturnType<typeof setInterval> | null = null

    // ── Actions ────────────────────────────────────────────────
    async function requestTrip(tripData: RequestTripData): Promise<Trip> {
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.requestTrip(tripData)
            currentTrip.value = trip
            addToast({ type: 'success', title: 'Viaje solicitado', message: 'Buscando conductor disponible...' })
            startPolling()
            return trip
        } finally {
            isLoading.value = false
        }
    }

    async function fetchActiveTrip(): Promise<Trip | null> {
        isLoading.value = true
        try {
            const trip = await tripService.getActiveTrip()
            currentTrip.value = trip
            return trip
        } finally {
            isLoading.value = false
        }
    }

    async function fetchAvailableTrips() {
        isLoading.value = true
        try {
            const trips = await tripService.getAvailableTrips()
            availableTrips.value = trips
        } finally {
            isLoading.value = false
        }
    }

    async function acceptTrip(tripId: string): Promise<Trip> {
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.acceptTrip(tripId)
            currentTrip.value = trip
            availableTrips.value = availableTrips.value.filter((t) => t.id !== tripId)
            addToast({ type: 'success', title: 'Viaje aceptado', message: 'Dirígete al punto de recogida' })
            return trip
        } finally {
            isLoading.value = false
        }
    }

    async function startRide(): Promise<void> {
        if (!currentTrip.value) return
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.updateTripStatus(currentTrip.value.id, 'on_ride')
            currentTrip.value = trip
            addToast({ type: 'info', title: 'Viaje iniciado', message: '¡Buen viaje!' })
        } finally {
            isLoading.value = false
        }
    }

    async function completeRide(): Promise<void> {
        if (!currentTrip.value) return
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.updateTripStatus(currentTrip.value.id, 'completed')
            currentTrip.value = trip
            stopPolling()
            addToast({ type: 'success', title: 'Viaje completado', message: '¡Gracias por usar TaxiGo!' })
        } finally {
            isLoading.value = false
        }
    }

    async function cancelTrip(): Promise<void> {
        if (!currentTrip.value) return
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.updateTripStatus(currentTrip.value.id, 'cancelled')
            currentTrip.value = trip
            stopPolling()
            addToast({ type: 'warning', title: 'Viaje cancelado' })
        } finally {
            isLoading.value = false
        }
    }

    function startPolling(intervalMs = 5000) {
        if (pollInterval) return
        isPolling.value = true
        pollInterval = setInterval(async () => {
            if (!currentTrip.value) return
            try {
                const trip = await tripService.getActiveTrip()
                if (trip) {
                    currentTrip.value = trip
                    if (trip.status === 'completed' || trip.status === 'cancelled') {
                        stopPolling()
                    }
                }
            } catch {
                // silently ignore polling errors
            }
        }, intervalMs)
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
        }
        isPolling.value = false
    }

    async function updateStatus(tripId: string, status: 'on_ride' | 'completed' | 'cancelled'): Promise<void> {
        const { addToast } = useToast()
        isLoading.value = true
        try {
            const trip = await tripService.updateTripStatus(tripId, status)
            currentTrip.value = trip
            if (status === 'completed' || status === 'cancelled') stopPolling()
            const messages: Record<string, { title: string; type: 'success' | 'warning' | 'info' }> = {
                on_ride: { title: 'Viaje iniciado', type: 'info' },
                completed: { title: '¡Viaje completado!', type: 'success' },
                cancelled: { title: 'Viaje cancelado', type: 'warning' },
            }
            const msg = messages[status]
            if (msg) addToast({ type: msg.type, title: msg.title })
        } finally {
            isLoading.value = false
        }
    }

    function clearTrip() {
        currentTrip.value = null
        availableTrips.value = []
        stopPolling()
    }

    return {
        currentTrip,
        availableTrips,
        isLoading,
        isPolling,
        requestTrip,
        fetchActiveTrip,
        fetchAvailableTrips,
        acceptTrip,
        startRide,
        completeRide,
        cancelTrip,
        updateStatus,
        startPolling,
        stopPolling,
        clearTrip,
    }
})

