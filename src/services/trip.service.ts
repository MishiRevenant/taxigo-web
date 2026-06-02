import api from './api'
import type { Trip, RequestTripData } from '@/types'

export const tripService = {
    async requestTrip(tripData: RequestTripData): Promise<Trip> {
        const { data } = await api.post<{ data: Trip }>('/trips', tripData)
        return data.data
    },

    async getActiveTrip(): Promise<Trip | null> {
        try {
            const { data } = await api.get<{ data: Trip }>('/trips/active')
            return data.data
        } catch (err: unknown) {
            const error = err as { response?: { status?: number } }
            if (error.response?.status === 404) return null
            throw err
        }
    },

    async getHistory(): Promise<Trip[]> {
        const { data } = await api.get<{ data: Trip[] }>('/trips/history')
        return data.data
    },

    async getAvailableTrips(): Promise<Trip[]> {
        const { data } = await api.get<{ data: Trip[] }>('/trips/available')
        return data.data
    },

    async acceptTrip(tripId: string): Promise<Trip> {
        const { data } = await api.post<{ data: Trip }>(`/trips/${tripId}/accept`)
        return data.data
    },

    /** Use the dedicated start endpoint (POST /trips/:id/start) */
    async startTrip(tripId: string): Promise<Trip> {
        const { data } = await api.post<{ data: Trip }>(`/trips/${tripId}/start`)
        return data.data
    },

    /** Use the dedicated complete endpoint (POST /trips/:id/complete) */
    async completeTrip(tripId: string): Promise<Trip> {
        const { data } = await api.post<{ data: Trip }>(`/trips/${tripId}/complete`)
        return data.data
    },

    /** Use the dedicated cancel endpoint (POST /trips/:id/cancel) */
    async cancelTrip(tripId: string): Promise<Trip> {
        const { data } = await api.post<{ data: Trip }>(`/trips/${tripId}/cancel`)
        return data.data
    },

    /** Legacy generic status update (keep for backwards compatibility) */
    async updateTripStatus(tripId: string, status: 'on_ride' | 'completed' | 'cancelled'): Promise<Trip> {
        // Route to the proper dedicated endpoint
        switch (status) {
            case 'on_ride':
                return this.startTrip(tripId)
            case 'completed':
                return this.completeTrip(tripId)
            case 'cancelled':
                return this.cancelTrip(tripId)
        }
    },

    async getTripById(tripId: string): Promise<Trip> {
        const { data } = await api.get<{ data: Trip }>(`/trips/${tripId}`)
        return data.data
    },
}
