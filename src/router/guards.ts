import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types'

// ── Auth Guard: requires authenticated user ──────────────────
export function authGuard(
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
        next()
    }
}

// ── Guest Guard: redirects logged-in users to their dashboard ─
export function guestGuard(
    _to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
) {
    const auth = useAuthStore()
    if (auth.isAuthenticated) {
        const role = auth.userRole as UserRole
        next({ name: role === 'driver' ? 'DriverDashboard' : 'PassengerDashboard' })
    } else {
        next()
    }
}

// ── Role Guard: restricts route access by role ───────────────
export function roleGuard(requiredRole: UserRole) {
    return (
        _to: RouteLocationNormalized,
        _from: RouteLocationNormalized,
        next: NavigationGuardNext,
    ) => {
        const auth = useAuthStore()
        const role = auth.userRole as UserRole | undefined
        if (!role) {
            // No role at all → push to login
            next({ name: 'Login' })
        } else if (role !== requiredRole) {
            // Wrong role → redirect to their dashboard
            next({ name: role === 'driver' ? 'DriverDashboard' : 'PassengerDashboard' })
        } else {
            next()
        }
    }
}
