import { defineStore } from 'pinia'
import { ref } from 'vue'
import { tripService } from '@/services/trip.service'
import type { Trip } from '@/types'

export const useHistoryStore = defineStore('history', () => {
    const trips = ref<Trip[]>([])
    const isLoading = ref(false)
    const lastFetched = ref<number | null>(null)

    async function fetchHistory(force = false) {
        const CACHE_MS = 30_000
        if (!force && lastFetched.value && Date.now() - lastFetched.value < CACHE_MS) return

        isLoading.value = true
        try {
            trips.value = await tripService.getHistory()
            lastFetched.value = Date.now()
        } finally {
            isLoading.value = false
        }
    }

    function addCompletedTrip(trip: Trip) {
        if (!trips.value.find((t) => t.id === trip.id)) {
            trips.value.unshift(trip)
        }
    }

    function clearHistory() {
        trips.value = []
        lastFetched.value = null
    }

    return { trips, isLoading, fetchHistory, addCompletedTrip, clearHistory }
})
