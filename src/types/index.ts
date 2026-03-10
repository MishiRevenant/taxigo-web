// ── Auth Types ──────────────────────────────────────────────────────────────

export type UserRole = 'passenger' | 'driver'

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    phone?: string
    rating?: number
    avatar?: string
    createdAt: string
}

export interface AuthCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    role: UserRole
    phone?: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface AuthResponse {
    user: User
    tokens: AuthTokens
}

// ── Trip Types ───────────────────────────────────────────────────────────────

export type TripStatus = 'requested' | 'accepted' | 'on_ride' | 'completed' | 'cancelled'

// Flat location for MapComponent props
export interface Location {
    lat: number
    lng: number
    address: string
}

export interface Trip {

    id: string
    passengerId: string
    driverId?: string
    passenger?: User
    driver?: User
    // Flat location fields matching backend
    originAddress: string
    originLat: number
    originLng: number
    destinationAddress: string
    destinationLat: number
    destinationLng: number
    status: TripStatus
    fare?: number
    distance?: number
    duration?: number
    vehicleType: 'standard' | 'comfort' | 'xl'
    notes?: string
    requestedAt: string
    acceptedAt?: string
    startedAt?: string
    completedAt?: string
}


export interface RequestTripData {
    originAddress: string
    destinationAddress: string
    vehicleType: 'standard' | 'comfort' | 'xl'
    notes?: string
}

// ── API Types ────────────────────────────────────────────────────────────────

export interface ApiError {
    message: string
    code?: string
    status?: number
}

export interface ApiResponse<T> {
    data: T
    message?: string
}

// ── Toast Types ──────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
}
