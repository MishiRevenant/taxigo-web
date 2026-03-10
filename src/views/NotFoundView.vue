<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-dark-400 px-4 selection:bg-accent selection:text-dark-400">
    <div class="text-center flex flex-col items-center gap-10 max-w-lg">
      <div class="relative">
        <h1 class="text-[12rem] font-black leading-none tracking-tighter text-white/5 italic">404</h1>
        <div class="absolute inset-0 flex items-center justify-center">
           <span class="text-2xl font-black uppercase tracking-[0.5em] text-accent animate-pulse shadow-glow">ERROR</span>
        </div>
      </div>
      
      <div class="space-y-3">
        <p class="text-2xl font-black text-white italic tracking-tight uppercase">INTERCEPCIÓN FALLIDA</p>
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">La coordenada solicitada no existe en el mapa operativo de TaxiGo.</p>
      </div>

      <button @click="router.push('/')" class="btn-primary h-14 px-12 text-[10px] font-black uppercase tracking-[0.3em] shadow-glow">
        Volver a Terminal
      </button>
    </div>
  </div>
</template>
