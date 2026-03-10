<script setup lang="ts">
import { Teleport, TransitionGroup } from 'vue'
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const icons: Record<string, string> = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

const styles: Record<string, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/5',
  error:   'border-red-500/30 bg-red-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  info:    'border-blue-500/30 bg-blue-500/5',
}

const iconStyles: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-400',
  error:   'bg-red-500/20 text-red-400',
  warning: 'bg-amber-500/20 text-amber-400',
  info:    'bg-blue-500/20 text-blue-400',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-3">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto glass border rounded-xl p-4 flex items-start gap-3 cursor-pointer"
          :class="styles[toast.type]"
          @click="removeToast(toast.id)"
        >
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold" :class="iconStyles[toast.type]">
            {{ icons[toast.type] }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white leading-tight">{{ toast.title }}</p>
            <p v-if="toast.message" class="text-xs text-white/60 mt-0.5 leading-relaxed">{{ toast.message }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
