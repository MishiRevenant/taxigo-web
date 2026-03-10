<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTripStore } from '@/stores/trip'
import { useHistoryStore } from '@/stores/history'
import AppLayout from '@/layouts/AppLayout.vue'
import TripCard from '@/components/TripCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const auth = useAuthStore()
const tripStore = useTripStore()
const historyStore = useHistoryStore()

const hasActiveTrip = computed(() =>
  tripStore.currentTrip && ['accepted','on_ride'].includes(tripStore.currentTrip.status),
)

onMounted(async () => {
  await Promise.all([
    tripStore.fetchActiveTrip(),
    tripStore.fetchAvailableTrips(),
    historyStore.fetchHistory(),
  ])
})

async function handleAccept(tripId: string) {
  await tripStore.acceptTrip(tripId)
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-10 py-6 animate-fade-in">
      <!-- Header Section -->
      <div class="flex items-center justify-between flex-wrap gap-6">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold text-white tracking-tighter italic">
            OPERADOR <span class="text-accent uppercase">{{ auth.user?.name?.split(' ')[0] }}</span>
          </h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Terminal de Control de Flota</p>
        </div>
        <div class="flex items-center gap-3 px-6 py-3 rounded-2xl border border-accent/20 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest shadow-glow">
          <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-glow"></span>
          Sistema en Línea
        </div>
      </div>

      <!-- Active Trip Banner -->
      <Transition name="slide-up">
        <div v-if="hasActiveTrip && tripStore.currentTrip" 
             class="bg-dark-100 border-y md:border border-white/5 md:rounded-2xl p-6 flex items-center justify-between gap-6 shadow-premium relative overflow-hidden group">
          <div class="absolute left-0 top-0 w-1 h-full bg-accent shadow-glow"></div>
          
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
               <span class="text-[9px] font-black text-accent uppercase tracking-widest animate-pulse">● Viaje Activo</span>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-white/90 truncate max-w-md">
                {{ tripStore.currentTrip.originAddress }}
              </p>
              <p class="text-[10px] font-medium text-white/30 uppercase tracking-widest italic">INTERCEPTANDO RUTA</p>
            </div>
            <div v-if="tripStore.currentTrip.passenger" class="flex items-center gap-2 mt-1">
              <p class="text-[10px] font-black text-white/50 uppercase">👤 {{ tripStore.currentTrip.passenger.name }} EN CABINA</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <RouterLink to="/driver/trip" class="btn-primary text-[10px] py-3 px-6 uppercase tracking-[0.2em] font-black">
              Gestión →
            </RouterLink>
          </div>
        </div>
      </Transition>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="premium-card flex flex-col gap-4">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Servicios</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-white tabular-nums">{{ historyStore.trips.length }}</span>
            <span class="text-xs text-white/20 font-bold uppercase italic">Completados</span>
          </div>
        </div>
        
        <div class="premium-card flex flex-col gap-4">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Eficiencia</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-white tabular-nums">{{ auth.user?.rating || '5.0' }}</span>
            <span class="text-xs text-accent font-bold uppercase italic text-glow">RATING</span>
          </div>
        </div>

        <div class="premium-card flex flex-col gap-4 border-accent/20">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Capital Generado</p>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-accent text-glow tabular-nums">
              {{ formatCurrency(historyStore.trips.reduce((s, t) => s + (t.fare || 0), 0)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Available Trips Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xs font-black text-white/50 uppercase tracking-[0.4em]">Despacho Disponible</h2>
            <div class="h-1 flex-1 min-w-[32px] bg-white/5 rounded-full"></div>
            <span class="text-[10px] font-black text-accent tabular-nums">{{ tripStore.availableTrips.length }}</span>
          </div>
          <div v-if="tripStore.isLoading" class="flex items-center gap-2">
             <LoadingSpinner size="sm" />
             <span class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Sincronizando...</span>
          </div>
        </div>

        <div v-if="tripStore.isLoading" class="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Buscando señales..." />
        </div>

        <div v-else-if="tripStore.availableTrips.length === 0" 
             class="premium-card flex flex-col items-center justify-center p-20 text-center gap-6 border-dashed">
          <div class="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-2xl text-white/10">🔍</div>
          <div class="space-y-2">
            <p class="text-lg font-bold text-white uppercase italic tracking-tighter">Sin solicitudes activas</p>
            <p class="text-sm text-white/30 max-w-xs">El sistema lo notificará en cuanto se detecte una nueva solicitud de servicio.</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TripCard
            v-for="trip in tripStore.availableTrips"
            :key="trip.id"
            :trip="trip"
            :show-actions="true"
            @accept="handleAccept"
          />
        </div>
      </div>
    </div>
  </AppLayout>
</template>
