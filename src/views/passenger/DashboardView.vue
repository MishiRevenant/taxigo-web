<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTripStore } from '@/stores/trip'
import { useHistoryStore } from '@/stores/history'
import AppLayout from '@/layouts/AppLayout.vue'
import TripStatusBadge from '@/components/TripStatusBadge.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const auth = useAuthStore()
const tripStore = useTripStore()
const historyStore = useHistoryStore()

const hasActiveTrip = computed(() =>
  tripStore.currentTrip && ['requested','accepted','on_ride'].includes(tripStore.currentTrip.status),
)

onMounted(async () => {
  await tripStore.fetchActiveTrip()
  await historyStore.fetchHistory()
})

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-10 py-6 animate-fade-in">
      <!-- Welcome Section -->
      <div class="flex items-center justify-between flex-wrap gap-6">
        <div class="space-y-1">
          <h1 class="text-4xl font-extrabold text-white tracking-tighter">
            HOLA, <span class="text-accent uppercase italic">{{ auth.user?.name?.split(' ')[0] }}</span>
          </h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Portal de Pasajero de Elite</p>
        </div>
        <RouterLink to="/passenger/request" class="btn-primary flex items-center gap-3 px-8 shadow-glow">
          <span class="text-lg">🚖</span>
          <span>Solicitar Viaje</span>
        </RouterLink>
      </div>

      <!-- Active Trip Banner -->
      <Transition name="slide-up">
        <div v-if="hasActiveTrip && tripStore.currentTrip" 
             class="bg-dark-100 border-y md:border border-white/5 md:rounded-2xl p-6 flex items-center justify-between gap-6 shadow-premium relative overflow-hidden group">
          <div class="absolute left-0 top-0 w-1 h-full bg-accent shadow-glow"></div>
          
          <div class="flex flex-col gap-3">
            <TripStatusBadge :status="tripStore.currentTrip.status" />
            <div class="space-y-1">
              <p class="text-xs font-bold text-white/90 truncate max-w-md">
                {{ tripStore.currentTrip.originAddress }}
              </p>
              <p class="text-[10px] font-medium text-white/30 uppercase tracking-widest">HACIA DESTINO SELECCIONADO</p>
            </div>
            <div v-if="tripStore.currentTrip.driver" class="flex items-center gap-2 mt-1">
              <div class="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
              <p class="text-[10px] font-black text-white/50 uppercase">🚗 {{ tripStore.currentTrip.driver.name }} EN CAMINO</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <LoadingSpinner v-if="tripStore.isPolling" size="sm" />
            <RouterLink to="/passenger/trip" class="btn-secondary text-[10px] py-2 px-4 uppercase tracking-[0.2em] font-black">
              Monitorizar →
            </RouterLink>
          </div>
        </div>
      </Transition>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="premium-card flex flex-col gap-4">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Total Viajes</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-white tabular-nums">{{ historyStore.trips.length }}</span>
            <span class="text-xs text-white/20 font-bold uppercase italic">Logrados</span>
          </div>
        </div>
        
        <div class="premium-card flex flex-col gap-4">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Reputación</p>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black text-white tabular-nums">{{ auth.user?.rating || '5.0' }}</span>
            <span class="text-xs text-accent font-bold uppercase italic text-glow">ESTRELLAS</span>
          </div>
        </div>

        <div class="premium-card flex flex-col gap-4 border-accent/20">
          <p class="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Capital Invertido</p>
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-black text-accent text-glow tabular-nums">
              {{ formatCurrency(historyStore.trips.reduce((s, t) => s + (t.fare || 0), 0)) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recent History Section -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-xs font-black text-white/50 uppercase tracking-[0.4em]">Actividad Reciente</h2>
          <RouterLink to="/passenger/history" class="text-[10px] font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
            Archivo Completo →
          </RouterLink>
        </div>

        <div v-if="historyStore.isLoading" class="flex justify-center py-20">
          <LoadingSpinner size="lg" label="Sincronizando Archivos..." />
        </div>

        <div v-else-if="historyStore.trips.length === 0" 
             class="premium-card flex flex-col items-center justify-center p-20 text-center gap-6 border-dashed">
          <div class="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-2xl text-white/10">🗺️</div>
          <div class="space-y-2">
            <p class="text-lg font-bold text-white">Sin Registro de Movilidad</p>
            <p class="text-sm text-white/30 max-w-xs">Aún no has solicitado servicios de lujo con TaxiGo.</p>
          </div>
          <RouterLink to="/passenger/request" class="btn-primary px-8">Solicitar mi primer viaje</RouterLink>
        </div>

        <div v-else class="space-y-3">
          <div v-for="trip in historyStore.trips.slice(0, 3)" :key="trip.id"
               class="bg-dark-100 hover:bg-dark-200 border border-white/5 rounded-2xl p-5 flex items-center gap-6 transition-all duration-300 group">
            <TripStatusBadge :status="trip.status" size="sm" />
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-white/80 truncate">{{ trip.originAddress }}</p>
              <p class="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Servicio COMPLETADO</p>
            </div>
            <div class="text-right">
              <p v-if="trip.fare" class="text-sm font-black text-white tabular-nums">
                {{ formatCurrency(trip.fare) }}
              </p>
              <p class="text-[9px] font-bold text-white/20 uppercase italic">Capital</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
