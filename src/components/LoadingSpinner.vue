<script setup lang="ts">
defineProps<{ size?: 'sm' | 'md' | 'lg'; label?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div
      class="rounded-full border-2 border-amber-400 border-t-transparent animate-spin"
      :class="{
        'w-4 h-4': size === 'sm',
        'w-6 h-6': size === 'md' || !size,
        'w-10 h-10': size === 'lg',
      }"
    ></div>
    <span v-if="label" class="text-xs text-white/40">{{ label }}</span>
  </div>
</template>
