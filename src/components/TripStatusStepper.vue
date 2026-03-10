<script setup lang="ts">
import type { TripStatus } from '@/types'

const props = defineProps<{ status: TripStatus }>()

const steps: { key: TripStatus; label: string }[] = [
  { key: 'requested', label: 'Solicitud' },
  { key: 'accepted',  label: 'Despacho' },
  { key: 'on_ride',   label: 'Transito' },
  { key: 'completed', label: 'Llegada' },
]

const order: Record<TripStatus, number> = {
  requested: 0, accepted: 1, on_ride: 2, completed: 3, cancelled: -1,
}

function stepState(step: TripStatus) {
  const cur = order[props.status]
  const s = order[step]
  if (s < cur) return 'done'
  if (s === cur) return 'active'
  return 'pending'
}
</script>

<template>
  <div class="flex items-center justify-between w-full px-2">
    <template v-for="(step, i) in steps" :key="step.key">
      <!-- Step Item -->
      <div class="flex flex-col items-center gap-3 relative z-10">
        <div
          class="w-4 h-4 rounded-full transition-all duration-700 border-2"
          :class="{
            'bg-white border-white shadow-glow': stepState(step.key) === 'done',
            'bg-accent border-accent shadow-glow scale-125': stepState(step.key) === 'active',
            'bg-dark-200 border-white/10': stepState(step.key) === 'pending',
          }"
        ></div>
        <span
          class="text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-500"
          :class="{
            'text-white/80': stepState(step.key) === 'done',
            'text-accent': stepState(step.key) === 'active',
            'text-white/20': stepState(step.key) === 'pending',
          }"
        >{{ step.label }}</span>
      </div>

      <!-- Connector -->
      <div
        v-if="i < steps.length - 1"
        class="flex-1 h-[1px] -mt-7 mx-[-8px] transition-all duration-700"
        :class="order[step.key] < order[status] ? 'bg-white/40' : 'bg-white/5'"
      ></div>
    </template>
  </div>
</template>
