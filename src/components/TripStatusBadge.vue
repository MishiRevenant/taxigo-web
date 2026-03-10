<script setup lang="ts">
import type { TripStatus } from '@/types'

defineProps<{ status: TripStatus; size?: 'sm' | 'md' }>()

const config: Record<TripStatus, { label: string; cls: string }> = {
  requested:  { label: 'Pendiente',  cls: 'bg-accent/10 text-accent border-accent/20' },
  accepted:   { label: 'Asignado',   cls: 'bg-white/5 text-white/80 border-white/10' },
  on_ride:    { label: 'En Viaje',   cls: 'bg-white/10 text-white border-accent/40 shadow-glow' },
  completed:  { label: 'Finalizado', cls: 'bg-dark-200 text-white/40 border-white/5' },
  cancelled:  { label: 'Cancelado',  cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-lg border font-black uppercase tracking-[0.15em] select-none shadow-sm"
    :class="[
      config[status]?.cls,
      size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1.5 text-[10px]',
    ]"
  >
    {{ config[status]?.label }}
  </span>
</template>
