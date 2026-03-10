<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTripStore } from '@/stores/trip'

const router = useRouter()
const auth = useAuthStore()
const trip = useTripStore()

const initials = computed(() => {
  const n = auth.user?.name || ''
  return n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
})

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-black border-b border-white/5 h-20 flex items-center shadow-premium">
    <div class="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
      <!-- Brand -->
      <RouterLink to="/" class="flex items-center gap-3 group transition-transform active:scale-95">
        <div class="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-xl shadow-glow group-hover:bg-accent-hover transition-colors">
          🚖
        </div>
        <div class="flex flex-col">
          <span class="font-black text-xl italic uppercase tracking-tighter text-white leading-none">TaxiGo</span>
          <span class="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 leading-none mt-1">Elite Urban</span>
        </div>
      </RouterLink>

      <!-- Nav links -->
      <nav v-if="auth.isAuthenticated" class="hidden md:flex items-center gap-2">
        <template v-if="auth.isPassenger">
          <RouterLink to="/passenger/dashboard" class="nav-link">Portal</RouterLink>
          <RouterLink to="/passenger/request" class="nav-link">Solicitar</RouterLink>
          <RouterLink to="/passenger/history" class="nav-link">Historial</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/driver/dashboard" class="nav-link">Portal</RouterLink>
          <RouterLink to="/driver/history" class="nav-link">Historial</RouterLink>
        </template>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-6">
        <!-- Indicators -->
        <div class="hidden sm:flex items-center gap-4">
           <!-- Active trip pulse -->
          <RouterLink
            v-if="trip.currentTrip && ['requested','accepted','on_ride'].includes(trip.currentTrip.status)"
            :to="auth.isDriver ? '/driver/trip' : '/passenger/trip'"
            class="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-widest animate-pulse"
          >
            <span class="w-2 h-2 rounded-full bg-accent animate-ping"></span>
            En Servicio
          </RouterLink>

          <!-- User Badge -->
          <div v-if="auth.isAuthenticated" class="text-right">
            <p class="text-[10px] font-black uppercase tracking-widest text-white/30">{{ auth.isDriver ? 'Conductor' : 'Pasajero' }}</p>
            <p class="text-xs font-bold text-white">{{ auth.user?.name }}</p>
          </div>
        </div>

        <!-- Avatar Menu -->
        <div v-if="auth.isAuthenticated" class="flex items-center gap-4 pl-6 border-l border-white/5">
          <div class="w-10 h-10 rounded-xl bg-dark-200 border border-white/5 flex items-center justify-center text-xs font-black text-accent select-none">
            {{ initials }}
          </div>
          <button
            @click="handleLogout"
            class="w-10 h-10 rounded-xl bg-dark-200 border border-white/5 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-400/20 transition-all active:scale-95"
            title="Cerrar sesión"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav-link {
  @apply px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-dark-100 transition-all;
}
.router-link-active.nav-link {
  @apply text-accent bg-accent/10;
}
</style>
