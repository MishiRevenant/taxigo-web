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
const cancelling = ref(false)

const trip = computed(() => tripStore.currentTrip)
const isCompleted = computed(() => trip.value?.status === 'completed')
const isCancelled = computed(() => trip.value?.status === 'cancelled')

onMounted(async () => {
  const t = await tripStore.fetchActiveTrip()
  if (!t) { router.push('/passenger/dashboard'); return }
  tripStore.startPolling()
})

onUnmounted(() => tripStore.stopPolling())

async function handleCancel() {
  if (!trip.value || cancelling.value) return
  cancelling.value = true
  try {
    await tripStore.updateStatus(trip.value.id, 'cancelled')
    router.push('/passenger/dashboard')
  } finally { cancelling.value = false }
}

function formatCurrency(n?: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n || 0)
}
</script>

<template>
  <AppLayout>
    <div v-if="!trip" class="flex flex-col items-center justify-center py-40 gap-6">
      <LoadingSpinner size="lg" />
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Localizando Registro de Viaje...</p>
    </div>

    <div v-else class="max-w-3xl mx-auto flex flex-col gap-10 py-6 animate-fade-in">
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
            <h1 class="text-3xl font-black text-white italic tracking-tighter uppercase">ESTADO DEL SERVICIO</h1>
            <div class="flex items-center gap-2">
              <LoadingSpinner v-if="tripStore.isPolling && !isCompleted && !isCancelled" size="sm" />
              <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                TRANSACCIÓN EN TIEMPO REAL
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stepper Section -->
      <div class="premium-card bg-dark-50 py-10">
        <TripStatusStepper :status="trip.status" />
      </div>

      <!-- Status Feedbacks -->
      <Transition name="slide-up">
        <div v-if="isCompleted" class="premium-card bg-accent/5 border-accent/20 flex flex-col items-center text-center gap-6 py-12 shadow-glow">
          <span class="text-6xl grayscale">💎</span>
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-white italic tracking-tighter uppercase">LLEGADA CONFIRMADA</h2>
            <p class="text-xs font-bold text-white/40 uppercase tracking-widest">Gracias por viajar con la elite</p>
          </div>
          <div v-if="trip.fare" class="text-4xl font-black text-accent text-glow tabular-nums">
            {{ formatCurrency(trip.fare) }}
          </div>
          <RouterLink to="/passenger/dashboard" class="btn-primary px-10">Finalizar Sesión de Viaje</RouterLink>
        </div>
      </Transition>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Details -->
        <div class="space-y-8">
           <!-- Map Preview -->
          <div class="premium-card p-0 overflow-hidden h-[300px] border-white/5 shadow-inner">
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
                <div class="w-1 h-1 bg-white rounded-full mt-1.5 shadow-glow"></div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">Salida</p>
                  <p class="text-xs font-bold text-white">{{ trip.originAddress }}</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-1 h-1 bg-accent rounded-full mt-1.5 shadow-glow"></div>
                <div class="space-y-1">
                  <p class="text-[10px] font-black text-white/30 uppercase tracking-widest">Destino</p>
                  <p class="text-xs font-bold text-white">{{ trip.destinationAddress }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Professional Profile -->
        <div class="space-y-8 text-white">
          <div v-if="trip.driver && ['accepted','on_ride'].includes(trip.status)" class="premium-card space-y-6 border-accent/20">
             <div class="flex items-center gap-3 opacity-30">
              <div class="w-1 h-3 bg-accent"></div>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Operador Asignado</p>
            </div>
            
            <div class="flex items-center gap-6">
              <div class="w-20 h-20 rounded-2xl bg-dark-200 border border-white/10 flex items-center justify-center text-3xl font-black text-accent bg-[url('https://api.dicebear.com/7.x/initials/svg?seed=driver')] bg-cover">
                <!-- Fallback to initials if image not loaded -->
                <span class="mix-blend-overlay">{{ trip.driver.name.charAt(0) }}</span>
              </div>
              <div class="space-y-1 flex-1">
                <p class="text-xl font-black tracking-tight italic uppercase">{{ trip.driver.name }}</p>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-bold text-accent italic">★ {{ trip.driver.rating }}</span>
                  <span class="w-1 h-1 bg-white/20 rounded-full"></span>
                  <span class="text-[10px] font-black text-white/30 uppercase tracking-widest">Nivel Pro</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
               <a v-if="trip.driver.phone" :href="`tel:${trip.driver.phone}`" class="btn-secondary h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  📞 Contactar
               </a>
               <button class="btn-secondary h-12 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50">
                  💬 Chat
               </button>
            </div>
          </div>

          <div class="premium-card space-y-6">
            <div class="flex items-center gap-3 opacity-30">
              <div class="w-1 h-3 bg-accent"></div>
              <p class="text-[9px] font-black uppercase tracking-[0.3em]">Métricas de Servicio</p>
            </div>
            
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-1">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Inversión</p>
                <p class="text-xl font-black text-accent tabular-nums">{{ formatCurrency(trip.fare) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Vehículo</p>
                <p class="text-xl font-black text-white uppercase italic">{{ trip.vehicleType }}</p>
              </div>
              <div v-if="trip.distance" class="space-y-1">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Trayecto</p>
                <p class="text-lg font-bold text-white/60 tabular-nums">{{ trip.distance }} km</p>
              </div>
            </div>
          </div>

          <!-- Cancelation -->
          <button 
            v-if="['requested','accepted'].includes(trip.status)" 
            :disabled="cancelling"
            @click="handleCancel"
            class="w-full text-[10px] font-black text-white/20 hover:text-red-500 uppercase tracking-[0.3em] transition-colors py-4"
          >
            {{ cancelling ? 'ABORTANDO SOLICITUD...' : 'SOLICITAR ANULACIÓN DE SERVICIO' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
