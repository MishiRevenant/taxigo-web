import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { authGuard, guestGuard, roleGuard } from './guards'

const routes: RouteRecordRaw[] = [
    // ── Public ──────────────────────────────────────────────────
    {
        path: '/',
        redirect: '/login',
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        beforeEnter: guestGuard,
        meta: { layout: 'auth', title: 'Iniciar Sesión' },
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        beforeEnter: guestGuard,
        meta: { layout: 'auth', title: 'Crear Cuenta' },
    },

    // ── Passenger Routes ─────────────────────────────────────────
    {
        path: '/passenger',
        beforeEnter: [authGuard, roleGuard('passenger')],
        children: [
            {
                path: 'dashboard',
                name: 'PassengerDashboard',
                component: () => import('@/views/passenger/DashboardView.vue'),
                meta: { title: 'Dashboard – Pasajero' },
            },
            {
                path: 'request',
                name: 'RequestTrip',
                component: () => import('@/views/passenger/RequestTripView.vue'),
                meta: { title: 'Solicitar Viaje' },
            },
            {
                path: 'trip',
                name: 'PassengerActiveTrip',
                component: () => import('@/views/passenger/ActiveTripView.vue'),
                meta: { title: 'Viaje Activo' },
            },
            {
                path: 'history',
                name: 'PassengerHistory',
                component: () => import('@/views/passenger/HistoryView.vue'),
                meta: { title: 'Historial de Viajes' },
            },
        ],
    },

    // ── Driver Routes ────────────────────────────────────────────
    {
        path: '/driver',
        beforeEnter: [authGuard, roleGuard('driver')],
        children: [
            {
                path: 'dashboard',
                name: 'DriverDashboard',
                component: () => import('@/views/driver/DashboardView.vue'),
                meta: { title: 'Dashboard – Conductor' },
            },
            {
                path: 'trip',
                name: 'DriverActiveTrip',
                component: () => import('@/views/driver/ActiveTripView.vue'),
                meta: { title: 'Viaje Activo' },
            },
            {
                path: 'history',
                name: 'DriverHistory',
                component: () => import('@/views/driver/HistoryView.vue'),
                meta: { title: 'Historial de Viajes' },
            },
        ],
    },

    // ── 404 ──────────────────────────────────────────────────────
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFoundView.vue'),
        meta: { title: 'Página no encontrada' },
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior() {
        return { top: 0 }
    },
})

// ── Update document title on navigation ─────────────────────
router.afterEach((to) => {
    const appTitle = import.meta.env.VITE_APP_TITLE || 'TaxiGo'
    const pageTitle = to.meta.title as string | undefined
    document.title = pageTitle ? `${pageTitle} | ${appTitle}` : appTitle
})

export default router
