<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useTripStore } from '@/stores/trip'
import AppLayout from '@/layouts/AppLayout.vue'

const router = useRouter()
const tripStore = useTripStore()

const schema = toTypedSchema(
  z.object({
    originAddress: z.string().min(5, 'Dirección requerida'),
    destinationAddress: z.string().min(5, 'Destino requerido'),
    vehicleType: z.enum(['standard', 'comfort', 'xl']),
    notes: z.string().max(200).optional(),
  }),
)

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: { vehicleType: 'standard' },
})

const { value: originAddress } = useField<string>('originAddress')
const { value: destinationAddress } = useField<string>('destinationAddress')
const { value: vehicleType } = useField<string>('vehicleType')
const { value: notes } = useField<string>('notes')

const vehicles = [
  { value: 'standard', label: 'Black',     icon: '🚗', desc: 'Sedán Ejecutivo', price: '12k+' },
  { value: 'comfort',  label: 'Luxe',      icon: '🚙', desc: 'SUV Premium',    price: '18k+' },
  { value: 'xl',       label: 'Ambassador',icon: '🚐', desc: 'Van de Lujo',   price: '25k+' },
]

const onSubmit = handleSubmit(async (values) => {
  await tripStore.requestTrip(values as Parameters<typeof tripStore.requestTrip>[0])
  router.push('/passenger/trip')
})
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto py-6 animate-fade-in">
      <!-- Header -->
      <div class="flex items-center gap-6 mb-12">
        <button 
          @click="$router.back()" 
          class="w-12 h-12 bg-dark-100 border border-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all active:scale-90"
        >
          ←
        </button>
        <div class="space-y-1">
          <h1 class="text-3xl font-black text-white italic tracking-tighter uppercase">NUEVO SERVICIO</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Configuración de Traslado</p>
        </div>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-10">
        <!-- Route Section -->
        <div class="premium-card space-y-6">
          <div class="flex items-center gap-3 opacity-30">
            <div class="w-1 h-4 bg-accent"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em]">Ruta de Servicio</h3>
          </div>
          
          <div class="grid grid-cols-1 gap-6">
            <div class="space-y-2">
              <label class="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Origen / Recogida</label>
              <input v-model="originAddress" type="text" class="input-field" :class="{ 'border-red-500/50': errors.originAddress }"
                placeholder="Introduzca dirección exacta" />
              <p v-if="errors.originAddress" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.originAddress }}</p>
            </div>
            
            <div class="space-y-2">
              <label class="text-[9px] font-black text-white/30 uppercase tracking-widest pl-1">Destino Final</label>
              <input v-model="destinationAddress" type="text" class="input-field" :class="{ 'border-red-500/50': errors.destinationAddress }"
                placeholder="¿Hacia dónde nos dirigimos?" />
              <p v-if="errors.destinationAddress" class="text-[9px] text-red-500 font-bold uppercase">{{ errors.destinationAddress }}</p>
            </div>
          </div>
        </div>

        <!-- Vehicle Selection -->
        <div class="space-y-6">
          <div class="flex items-center gap-3 opacity-30">
            <div class="w-1 h-4 bg-accent"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em]">Clase de Vehículo</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button v-for="v in vehicles" :key="v.value" type="button"
              @click="vehicleType = v.value"
              class="premium-card flex flex-col items-center gap-4 text-center group transition-all duration-500"
              :class="vehicleType === v.value ? 'bg-dark-200 border-accent/40 ring-1 ring-accent/20' : 'opacity-60 hover:opacity-100 hover:border-white/10'"
            >
              <div class="text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-500" :class="{ 'grayscale-0 scale-110': vehicleType === v.value }">
                {{ v.icon }}
              </div>
              <div class="space-y-1">
                <p class="text-xs font-black uppercase tracking-widest" :class="vehicleType === v.value ? 'text-accent' : 'text-white'">{{ v.label }}</p>
                <p class="text-[9px] text-white/20 font-bold uppercase tracking-tighter">{{ v.desc }}</p>
              </div>
              <p class="text-xs font-black text-white px-3 py-1 bg-white/5 rounded-full tabular-nums">{{ v.price }}</p>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="premium-card space-y-4">
          <div class="flex items-center gap-3 opacity-30">
            <div class="w-1 h-4 bg-accent"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em]">Instrucciones de Servicio</h3>
          </div>
          <textarea v-model="notes" class="input-field min-h-[100px] resize-none"
            placeholder="Ej: Equipaje especial, puerta principal, etc..."></textarea>
        </div>

        <!-- Submission -->
        <div class="pt-6 border-t border-white/5 flex flex-col gap-6">
          <div class="flex items-center justify-between px-2">
            <div class="space-y-1">
              <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Estimación de Tarifa</p>
              <p class="text-2xl font-black text-white tabular-nums">
                {{ vehicleType === 'standard' ? '$12.500' : vehicleType === 'comfort' ? '$18.900' : '$25.000' }}
              </p>
            </div>
            <div class="text-right space-y-1">
              <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Tiempo de Llegada</p>
              <p class="text-lg font-black text-accent uppercase italic">~8 MINUTOS</p>
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting" 
            class="btn-primary w-full h-16 text-xl shadow-glow relative overflow-hidden group"
          >
            <span class="relative z-10 flex items-center justify-center gap-3">
              {{ isSubmitting ? 'LOCALIZANDO UNIDAD...' : 'CONFIRMAR SERVICIO BLACK' }}
            </span>
            <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
          </button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>
