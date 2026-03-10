<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'
import type { RegisterData } from '@/types'

const router = useRouter()
const auth = useAuthStore()

const schema = toTypedSchema(
  z.object({
    name: z.string().min(2, 'Min. 2 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Min. 6 caracteres'),
    role: z.enum(['passenger', 'driver']),
    phone: z.string().min(8, 'Teléfono requerido'),
  }),
)

const { handleSubmit, errors, isSubmitting, setFieldValue } = useForm<RegisterData>({
  validationSchema: schema,
  initialValues: { 
    name: '',
    email: '',
    password: '',
    role: 'passenger',
    phone: ''
  },
})

const { value: name } = useField<string>('name')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: role } = useField<'passenger' | 'driver'>('role')
const { value: phone } = useField<string>('phone')

const apiError = ref('')

const onSubmit = handleSubmit(async (values) => {
  apiError.value = ''
  try {
    await auth.register(values)
    router.push(values.role === 'driver' ? '/driver/dashboard' : '/passenger/dashboard')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    apiError.value = e.response?.data?.message || 'Error en el registro'
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-black animate-fade-in">
    <div class="w-full max-w-lg">
      <div class="text-center mb-10 text-white">
        <h1 class="text-3xl font-black italic uppercase tracking-tighter">Únete a TaxiGo</h1>
        <p class="text-white/30 text-xs font-bold uppercase tracking-widest mt-2">Elite Transportation Network</p>
      </div>

      <div class="premium-card space-y-8 animate-slide-up bg-dark-100 p-8 rounded-2xl border border-white/5">
        <form @submit.prevent="onSubmit" class="space-y-8">
          <!-- Role Selection -->
          <div class="grid grid-cols-2 gap-4 text-center">
            <button
              type="button"
              @click="setFieldValue('role', 'passenger')"
              class="flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300"
              :class="role === 'passenger' ? 'bg-accent/10 border-accent text-accent' : 'bg-dark-200 border-white/5 text-white/40 hover:border-white/20'"
            >
              <span class="text-3xl">👤</span>
              <span class="text-xs font-black uppercase tracking-widest">Pasajero</span>
            </button>
            <button
              type="button"
              @click="setFieldValue('role', 'driver')"
              class="flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300"
              :class="role === 'driver' ? 'bg-accent/10 border-accent text-accent' : 'bg-dark-200 border-white/5 text-white/40 hover:border-white/20'"
            >
              <span class="text-3xl">🚗</span>
              <span class="text-xs font-black uppercase tracking-widest">Conductor</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Nombre Completo</label>
              <input v-model="name" type="text" placeholder="Ej: Juan Pérez" class="input-field" :class="{ 'border-red-500/50': errors.name }" />
              <p v-if="errors.name" class="text-[9px] text-red-500 font-bold uppercase pl-1">{{ errors.name }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Email Corporativo</label>
              <input v-model="email" type="email" placeholder="juan@ejemplo.com" class="input-field" :class="{ 'border-red-500/50': errors.email }" />
              <p v-if="errors.email" class="text-[9px] text-red-500 font-bold uppercase pl-1">{{ errors.email }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Teléfono</label>
              <input v-model="phone" type="tel" placeholder="+34 600 000 000" class="input-field" :class="{ 'border-red-500/50': errors.phone }" />
              <p v-if="errors.phone" class="text-[9px] text-red-500 font-bold uppercase pl-1">{{ errors.phone }}</p>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Contraseña</label>
              <input v-model="password" type="password" placeholder="••••••••" class="input-field" :class="{ 'border-red-500/50': errors.password }" />
              <p v-if="errors.password" class="text-[9px] text-red-500 font-bold uppercase pl-1">{{ errors.password }}</p>
            </div>
          </div>

          <div v-if="apiError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium text-center">
            {{ apiError }}
          </div>

          <button type="submit" :disabled="isSubmitting" class="btn-primary w-full shadow-glow">
            {{ isSubmitting ? 'Registrando Perfil...' : 'Crear Cuenta' }}
          </button>
        </form>

        <p class="text-center text-sm text-white/30 font-medium">
          ¿Ya eres miembro?
          <RouterLink to="/login" class="text-accent hover:text-white transition-colors underline underline-offset-4">Iniciar Sesión</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
