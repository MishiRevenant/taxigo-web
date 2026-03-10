<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

<template>
  <div class="min-h-screen bg-dark-400 flex flex-col font-sans selection:bg-accent selection:text-dark-400">
    <AppHeader />
    <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-8 py-10">
      <div class="animate-fade-in">
        <slot />
      </div>
    </main>
  </div>
</template>
