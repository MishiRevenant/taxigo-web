<script setup lang="ts">
import { onMounted } from 'vue'
import { useHistoryStore } from '@/stores/history'
import AppLayout from '@/layouts/AppLayout.vue'
import TripCard from '@/components/TripCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const historyStore = useHistoryStore()
onMounted(() => historyStore.fetchHistory())
</script>

<template>
  <AppLayout>
    <div class="flex flex-col gap-10 py-6 animate-fade-in">
      <!-- Header Area -->
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <h1 class="text-3xl font-black text-white italic tracking-tighter uppercase">HISTORIAL OPERATIVO</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Registro de Despachos y Servicios</p>
        </div>
        <div class="hidden md:block">
           <div class="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-white/20 uppercase tracking-widest italic">
              Terminal Operativa
           </div>
        </div>
      </div>

      <div v-if="historyStore.isLoading" class="flex flex-col items-center justify-center py-40 gap-6">
        <LoadingSpinner size="lg" />
        <p class="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Sincronizando Archivo Local...</p>
      </div>

      <div v-else-if="historyStore.trips.length === 0" 
           class="premium-card flex flex-col items-center justify-center p-20 text-center gap-6 border-dashed">
        <div class="w-16 h-16 rounded-full bg-dark-200 flex items-center justify-center text-2xl text-white/10 italic">D</div>
        <div class="space-y-2">
          <p class="text-lg font-bold text-white uppercase italic tracking-tighter">Sin Servicios Registrados</p>
          <p class="text-sm text-white/30 max-w-xs">Aún no se ha completado ningún servicio bajo este perfil operativo.</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TripCard v-for="trip in historyStore.trips" :key="trip.id" :trip="trip" />
      </div>
    </div>
  </AppLayout>
</template>
