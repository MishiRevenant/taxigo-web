<script setup lang="ts">
import type { Trip } from '@/types'
import TripStatusBadge from './TripStatusBadge.vue'

interface Props {
  trip: Trip
  showActions?: boolean
}
defineProps<Props>()
defineEmits<{ accept: [tripId: string] }>()

function formatCurrency(amount?: number) {
  if (!amount) return '–'
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(d?: string) {
  if (!d) return ''
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d))
}
</script>

<template>
  <div class="premium-card flex flex-col gap-6 hover:border-white/10 hover:bg-dark-200 transition-all duration-500 group">
    <!-- Route -->
    <div class="flex items-start justify-between gap-4">
      <div class="space-y-3 flex-1 min-w-0">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-1.5 rounded-full bg-white shadow-glow flex-shrink-0"></div>
          <p class="text-xs font-bold text-white truncate">{{ trip.originAddress }}</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-1.5 rounded-full bg-accent shadow-glow flex-shrink-0"></div>
          <p class="text-xs font-bold text-white/60 truncate italic">{{ trip.destinationAddress }}</p>
        </div>
      </div>
      <TripStatusBadge :status="trip.status" size="sm" />
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
      <div class="space-y-1">
        <p class="text-[9px] font-black text-white/20 uppercase tracking-widest">Inversión / Tarifa</p>
        <p class="text-sm font-black text-accent tabular-nums">{{ formatCurrency(trip.fare) }}</p>
      </div>
      <div v-if="trip.distance" class="space-y-1">
        <p class="text-[9px] font-black text-white/20 uppercase tracking-widest">Distancia</p>
        <p class="text-sm font-black text-white tabular-nums">{{ trip.distance }} km</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <p class="text-[9px] font-black text-white/20 uppercase tracking-widest">{{ formatDate(trip.requestedAt) }}</p>
        <p class="text-[9px] font-bold text-white/40 uppercase italic tracking-tighter">{{ trip.vehicleType }} Edition</p>
      </div>
      
      <button
        v-if="showActions && trip.status === 'requested'"
        @click="$emit('accept', trip.id)"
        class="btn-primary h-10 px-6 text-[10px] uppercase font-black tracking-[0.2em] shadow-glow"
      >
        ACEPTAR
      </button>
    </div>
  </div>
</template>
