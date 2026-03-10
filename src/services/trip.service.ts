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

    async updateTripStatus(tripId: string, status: 'on_ride' | 'completed' | 'cancelled'): Promise<Trip> {
        const { data } = await api.patch<{ data: Trip }>(`/trips/${tripId}/status`, { status })
        return data.data
    },

    async getTripById(tripId: string): Promise<Trip> {
        const { data } = await api.get<{ data: Trip }>(`/trips/${tripId}`)
        return data.data
    },
}
