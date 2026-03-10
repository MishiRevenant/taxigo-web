<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '@/stores/trip'
import AppLayout from '@/layouts/AppLayout.vue'
import TripStatusStepper from '@/components/TripStatusStepper.vue'
import MapComponent from '@/components/MapComponent.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const tripStore = useTripStore()
const isUpdating = ref(false)

const trip = computed(() => tripStore.currentTrip)

onMounted(async () => {
  const t = await tripStore.fetchActiveTrip()
  if (!t) { router.push('/driver/dashboard'); return }
  tripStore.startPolling()
})
onUnmounted(() => tripStore.stopPolling())

async function updateStatus(status: 'on_ride' | 'completed') {
  if (!trip.value || isUpdating.value) return
  isUpdating.value = true
  try {
    await tripStore.updateStatus(trip.value.id, status)
    if (status === 'completed') router.push('/driver/dashboard')
  } finally { isUpdating.value = false }
}

function formatCurrency(n?: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)
}
</script>

<template>
  <AppLayout>
    <div v-if="!trip" class="flex flex-col items-center justify-center py-40 gap-6">
      <LoadingSpinner size="lg" />
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Inicializando Protocolo de Viaje...</p>
    </div>

    <div v-else class="max-w-4xl mx-auto flex flex-col gap-10 py-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <button 
            @click="$router.back()" 
            class="w-12 h-12 bg-dark-100 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-all"
          >
            ←
          </button>
          <div class="space-y-1">
            <h1 class="text-3xl font-black text-white italic tracking-tighter uppercase">CONTROL DE MISIÓN</h1>
            <div class="flex items-center gap-2">
              <LoadingSpinner v-if="tripStore.isPolling" size="sm" />
              <p class="text-[9px] font-black uppercase tracking-[0.3em] text-accent">
                MONITOREO ACTIVO
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stepper Section (Horizontal) -->
      <div class="premium-card bg-dark-50 py-10">
        <TripStatusStepper :status="trip.status" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Left: Route & Map (Col 7) -->
        <div class="lg:col-span-7 space-y-8">
          <div class="premium-card p-0 overflow-hidden h-[400px] border-white/5 shadow-inner">
            <MapComponent
              v-if="trip.originAddress && trip.destinationAddress"
              :origin="{ lat: trip.originLat, lng: trip.originLng, address: trip.originAddress }"
              :destination="{ lat: trip.destinationLat, lng: trip.destinationLng, address: trip.destinationAddress }"
              height="100%"
            />
          </div>

          <div class="premium-card space-y-6">
            <div class="flex items-center gap-3 opacity-30">
              <div class="w-1 h-3 bg-accent"></div>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Manifiesto de Ruta</p>
            </div>
            
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">Punto de Recogida</p>
                  <p class="text-sm font-bold text-white">{{ trip.originAddress }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-1.5 h-1.5 bg-accent rounded-full mt-1.5 shadow-glow"></div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">Punto de Entrega</p>
                  <p class="text-sm font-bold text-white">{{ trip.destinationAddress }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Actions & Client (Col 5) -->
        <div class="lg:col-span-5 space-y-8">
          <!-- Passenger Card -->
          <div v-if="trip.passenger" class="premium-card space-y-6 border-accent/20">
            <div class="flex items-center gap-3 opacity-30">
              <div class="w-1 h-3 bg-accent"></div>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Cliente en Servicio</p>
            </div>
            
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 rounded-2xl bg-dark-200 border border-white/10 flex items-center justify-center text-3xl font-black text-white/20">
                {{ trip.passenger.name.charAt(0) }}
              </div>
              <div class="space-y-1">
                <p class="text-xl font-black tracking-tight italic uppercase">{{ trip.passenger.name }}</p>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-accent italic">★ {{ trip.passenger.rating }}</span>
                  <span class="text-[10px] font-black text-white/30 uppercase tracking-widest underline decoration-accent/50">Cliente Verificado</span>
                </div>
              </div>
            </div>

            <div v-if="trip.notes" class="p-4 bg-dark-200 rounded-xl border-l-2 border-accent/40">
              <p class="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Notas Especiales</p>
              <p class="text-xs font-bold text-white/80 italic">"{{ trip.notes }}"</p>
            </div>

            <div class="grid grid-cols-1 gap-4">
               <a v-if="trip.passenger.phone" :href="`tel:${trip.passenger.phone}`" 
                  class="btn-secondary h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border-accent/10">
                  📞 Contactar Cliente
               </a>
            </div>
          </div>

          <!-- Trip Metrics -->
          <div class="premium-card space-y-6">
             <div class="flex items-center gap-3 opacity-30">
              <div class="w-1 h-3 bg-accent"></div>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Métricas de Operación</p>
            </div>
            
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-1">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Honorarios</p>
                <p class="text-2xl font-black text-accent tabular-nums">{{ formatCurrency(trip.fare) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Distancia Total</p>
                <p class="text-xl font-black text-white tabular-nums">{{ trip.distance }} KM</p>
              </div>
            </div>
          </div>

          <!-- Major Action Controls -->
          <div class="space-y-6 pt-6">
             <!-- Status Feedbacks -->
            <Transition name="slide-up">
              <div v-if="trip.status === 'completed'" class="premium-card bg-accent/5 border-accent/20 flex flex-col items-center text-center gap-6 py-10">
                <span class="text-4xl">💎</span>
                <div class="space-y-1">
                  <h2 class="text-2xl font-black text-white uppercase italic tracking-tighter">MISIÓN COMPLETADA</h2>
                  <p class="text-[9px] font-bold text-white/30 uppercase tracking-widest">Fondos acreditados al operador</p>
                </div>
                <RouterLink to="/driver/dashboard" class="btn-primary w-full h-14">Cerrar Manifiesto</RouterLink>
              </div>
            </Transition>

            <div v-if="trip.status !== 'completed'" class="flex flex-col gap-4">
              <button 
                v-if="trip.status === 'accepted'" 
                :disabled="isUpdating"
                @click="updateStatus('on_ride')"
                class="btn-primary w-full h-20 text-xl shadow-glow relative overflow-hidden group"
              >
                <span class="relative z-10 flex items-center justify-center gap-3">
                   {{ isUpdating ? 'PROTOCOLIZANDO...' : 'INICIAR TRASLADO BLACK' }}
                </span>
                <div class="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
              </button>

              <button 
                v-if="trip.status === 'on_ride'" 
                :disabled="isUpdating"
                @click="updateStatus('completed')"
                class="btn-primary w-full h-20 text-xl shadow-glow bg-accent border-accent text-dark-400 group relative overflow-hidden"
              >
                <span class="relative z-10 flex items-center justify-center gap-3 font-black">
                   {{ isUpdating ? 'FINALIZANDO...' : 'COMPLETAR MISIÓN' }}
                </span>
                <div class="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
