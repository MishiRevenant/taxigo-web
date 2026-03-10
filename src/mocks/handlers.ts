import { http, HttpResponse, delay } from 'msw'
import type { User, Trip, TripStatus } from '@/types'

// ── Mock Data ────────────────────────────────────────────────
const passengerUser: User = {
    id: 'user-passenger-1',
    name: 'Carlos Méndez',
    email: 'passenger@taxigo.com',
    role: 'passenger',
    phone: '+57 300 123 4567',
    rating: 4.8,
    createdAt: '2024-01-15T10:00:00Z',
}

const driverUser: User = {
    id: 'user-driver-1',
    name: 'Luis Rodríguez',
    email: 'driver@taxigo.com',
    role: 'driver',
    phone: '+57 311 987 6543',
    rating: 4.9,
    createdAt: '2024-01-10T08:00:00Z',
}

const USERS: Record<string, User> = {
    'passenger@taxigo.com': passengerUser,
    'driver@taxigo.com': driverUser,
}

const TOKENS: Record<string, string> = {
    'user-passenger-1': 'mock-access-token-passenger',
    'user-driver-1': 'mock-access-token-driver',
}

type TripStore = Record<string, Trip>
// Shared mutable trip state between handlers
const trips: TripStore = {
    'trip-history-1': {
        id: 'trip-history-1',
        passengerId: 'user-passenger-1',
        driverId: 'user-driver-1',
        passenger: passengerUser,
        driver: driverUser,
        originAddress: 'Calle 100 #15-10, Bogotá',
        originLat: 4.6097, originLng: -74.0817,
        destinationAddress: 'El Dorado, Bogotá',
        destinationLat: 4.6558, destinationLng: -74.0553,
        status: 'completed',
        fare: 25000,
        distance: 12.5,
        duration: 35,
        vehicleType: 'standard',
        requestedAt: '2025-03-01T14:00:00Z',
        acceptedAt: '2025-03-01T14:02:00Z',
        startedAt: '2025-03-01T14:08:00Z',
        completedAt: '2025-03-01T14:43:00Z',
    },
    'trip-history-2': {
        id: 'trip-history-2',
        passengerId: 'user-passenger-1',
        driverId: 'user-driver-1',
        passenger: passengerUser,
        driver: driverUser,
        originAddress: 'Carrera 7 #32-16, Bogotá',
        originLat: 4.6097, originLng: -74.0817,
        destinationAddress: 'Zona Rosa, Bogotá',
        destinationLat: 4.6487, destinationLng: -74.0779,
        status: 'completed',
        fare: 18000,
        distance: 8.2,
        duration: 22,
        vehicleType: 'comfort',
        requestedAt: '2025-02-28T09:00:00Z',
        acceptedAt: '2025-02-28T09:03:00Z',
        startedAt: '2025-02-28T09:10:00Z',
        completedAt: '2025-02-28T09:32:00Z',
    },
}

let activeTrip: Trip | null = null

function getUserFromToken(authHeader: string | null): User | null {
    if (!authHeader) return null
    const token = authHeader.replace('Bearer ', '')
    if (token === 'mock-access-token-passenger') return passengerUser
    if (token === 'mock-access-token-driver') return driverUser
    return null
}

// ── Handlers ─────────────────────────────────────────────────
export const handlers = [
    // POST /api/auth/login
    http.post('/api/auth/login', async ({ request }) => {
        await delay(600)
        const body = await request.json() as { email: string; password: string }
        const user = USERS[body.email]

        if (!user || body.password !== 'password') {
            return HttpResponse.json(
                { message: 'Credenciales incorrectas. Usa: passenger@taxigo.com o driver@taxigo.com / password' },
                { status: 401 },
            )
        }

        return HttpResponse.json({
            data: {
                user,
                tokens: {
                    accessToken: TOKENS[user.id],
                    refreshToken: `mock-refresh-token-${user.id}`,
                },
            },
        })
    }),

    // POST /api/auth/register
    http.post('/api/auth/register', async ({ request }) => {
        await delay(800)
        const body = await request.json() as {
            name: string; email: string; role: string; phone?: string
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            name: body.name,
            email: body.email,
            role: body.role as 'passenger' | 'driver',
            phone: body.phone,
            rating: 5.0,
            createdAt: new Date().toISOString(),
        }

        const accessToken = `mock-access-token-${newUser.id}`
        USERS[body.email] = newUser
        TOKENS[newUser.id] = accessToken

        return HttpResponse.json({
            data: {
                user: newUser,
                tokens: {
                    accessToken,
                    refreshToken: `mock-refresh-${newUser.id}`,
                },
            },
        }, { status: 201 })
    }),

    // POST /api/auth/logout
    http.post('/api/auth/logout', async () => {
        await delay(200)
        return HttpResponse.json({ message: 'Sesión cerrada' })
    }),

    // GET /api/auth/me
    http.get('/api/auth/me', async ({ request }) => {
        await delay(300)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })
        return HttpResponse.json({ data: { user } })
    }),

    // POST /api/auth/refresh
    http.post('/api/auth/refresh', async () => {
        await delay(300)
        return HttpResponse.json({ data: { accessToken: 'mock-access-token-passenger' } })
    }),

    // POST /api/trips – request trip (passenger)
    http.post('/api/trips', async ({ request }) => {
        await delay(700)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })

        const body = await request.json() as {
            originAddress: string; destinationAddress: string; vehicleType: string; notes?: string
        }

        const newTrip: Trip = {
            id: `trip-${Date.now()}`,
            passengerId: user.id,
            passenger: user,
            originAddress: body.originAddress,
            originLat: 4.6097 + (Math.random() - 0.5) * 0.02,
            originLng: -74.0817 + (Math.random() - 0.5) * 0.02,
            destinationAddress: body.destinationAddress,
            destinationLat: 4.6558 + (Math.random() - 0.5) * 0.02,
            destinationLng: -74.0553 + (Math.random() - 0.5) * 0.02,
            status: 'requested',
            vehicleType: body.vehicleType as 'standard' | 'comfort' | 'xl',
            notes: body.notes,
            requestedAt: new Date().toISOString(),
        }

        trips[newTrip.id] = newTrip
        activeTrip = newTrip

        // Simulate driver accepting after 6s
        setTimeout(() => {
            if (activeTrip?.id === newTrip.id && activeTrip.status === 'requested') {
                trips[newTrip.id].status = 'accepted'
                trips[newTrip.id].driverId = driverUser.id
                trips[newTrip.id].driver = driverUser
                trips[newTrip.id].acceptedAt = new Date().toISOString()
                trips[newTrip.id].fare = Math.floor(15000 + Math.random() * 30000)
                trips[newTrip.id].distance = Math.round((5 + Math.random() * 20) * 10) / 10
                if (activeTrip) Object.assign(activeTrip, trips[newTrip.id])
            }
        }, 6000)

        return HttpResponse.json({ data: newTrip }, { status: 201 })
    }),

    // GET /api/trips/active
    http.get('/api/trips/active', async ({ request }) => {
        await delay(300)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })

        if (!activeTrip) return HttpResponse.json({ message: 'No hay viaje activo' }, { status: 404 })

        // Return fresh data from trips store
        const fresh = trips[activeTrip.id] || activeTrip
        return HttpResponse.json({ data: fresh })
    }),

    // GET /api/trips/history
    http.get('/api/trips/history', async ({ request }) => {
        await delay(500)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })

        const completed = Object.values(trips).filter(
            (t) => (t.status === 'completed' || t.status === 'cancelled') &&
                (user.role === 'passenger' ? t.passengerId === user.id : t.driverId === user.id),
        )

        return HttpResponse.json({ data: completed.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)) })
    }),

    // GET /api/trips/available – for drivers
    http.get('/api/trips/available', async ({ request }) => {
        await delay(400)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user || user.role !== 'driver') return HttpResponse.json({ message: 'Acceso denegado' }, { status: 403 })

        const available = Object.values(trips).filter((t) => t.status === 'requested' && !t.driverId)
        return HttpResponse.json({ data: available })
    }),

    // POST /api/trips/:id/accept
    http.post('/api/trips/:id/accept', async ({ request, params }) => {
        await delay(500)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user || user.role !== 'driver') return HttpResponse.json({ message: 'Acceso denegado' }, { status: 403 })

        const tripId = params.id as string
        const trip = trips[tripId]
        if (!trip) return HttpResponse.json({ message: 'Viaje no encontrado' }, { status: 404 })
        if (trip.status !== 'requested') return HttpResponse.json({ message: 'El viaje ya no está disponible' }, { status: 409 })

        trip.status = 'accepted'
        trip.driverId = user.id
        trip.driver = user
        trip.acceptedAt = new Date().toISOString()
        trip.fare = Math.floor(15000 + Math.random() * 30000)
        trip.distance = Math.round((5 + Math.random() * 20) * 10) / 10

        activeTrip = trip

        return HttpResponse.json({ data: trip })
    }),

    // PATCH /api/trips/:id/status
    http.patch('/api/trips/:id/status', async ({ request, params }) => {
        await delay(400)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })

        const tripId = params.id as string
        const trip = trips[tripId]
        if (!trip) return HttpResponse.json({ message: 'Viaje no encontrado' }, { status: 404 })

        const body = await request.json() as { status: TripStatus }
        trip.status = body.status

        if (body.status === 'on_ride') trip.startedAt = new Date().toISOString()
        if (body.status === 'completed') {
            trip.completedAt = new Date().toISOString()
            trip.duration = Math.floor(15 + Math.random() * 40)
            activeTrip = null
        }
        if (body.status === 'cancelled') activeTrip = null

        return HttpResponse.json({ data: trip })
    }),

    // GET /api/trips/:id
    http.get('/api/trips/:id', async ({ request, params }) => {
        await delay(300)
        const user = getUserFromToken(request.headers.get('Authorization'))
        if (!user) return HttpResponse.json({ message: 'No autorizado' }, { status: 401 })

        const trip = trips[params.id as string]
        if (!trip) return HttpResponse.json({ message: 'Viaje no encontrado' }, { status: 404 })
        return HttpResponse.json({ data: trip })
    }),
]
