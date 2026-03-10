<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Contraseña requerida'),
  }),
)

const { handleSubmit, errors, isSubmitting } = useForm({ validationSchema: schema })
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const apiError = ref('')

const onSubmit = handleSubmit(async (values) => {
  apiError.value = ''
  try {
    await auth.login(values)
    const redirect = route.query.redirect as string
    const dest = redirect || (auth.isDriver ? '/driver/dashboard' : '/passenger/dashboard')
    router.push(dest)
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    apiError.value = e.response?.data?.message || 'Error al iniciar sesión'
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-black animate-fade-in">
    <div class="w-full max-w-md">
      <!-- Minimalist Logo -->
      <div class="flex flex-col items-center mb-12">
        <div class="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-glow">
          🚖
        </div>
        <h1 class="text-4xl font-extrabold tracking-tighter text-white uppercase italic">TaxiGo</h1>
        <p class="text-white/30 text-xs font-semibold uppercase tracking-[0.2em] mt-2">Premium Urban Mobility</p>
      </div>

      <!-- Auth Card -->
      <div class="premium-card space-y-8 animate-slide-up">
        <div class="text-center">
          <h2 class="text-xl font-bold text-white tracking-tight">Acceso Privado</h2>
          <p class="text-white/40 text-sm">Bienvenido de nuevo</p>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-6">
          <div class="space-y-2">
            <label for="email" class="text-xs font-bold text-white/50 uppercase tracking-widest pl-1">Email</label>
            <input
              v-model="email"
              id="email"
              type="email"
              placeholder="nombre@ejemplo.com"
              class="input-field"
              :class="{ 'border-red-500/50': errors.email }"
            />
            <p v-if="errors.email" class="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">{{ errors.email }}</p>
          </div>

          <div class="space-y-2">
            <label for="password" class="text-xs font-bold text-white/50 uppercase tracking-widest pl-1">Contraseña</label>
            <input
              v-model="password"
              id="password"
              type="password"
              placeholder="••••••••"
              class="input-field"
              :class="{ 'border-red-500/50': errors.password }"
            />
            <p v-if="errors.password" class="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-1">{{ errors.password }}</p>
          </div>

          <div v-if="apiError" class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium text-center">
            {{ apiError }}
          </div>

          <button type="submit" :disabled="isSubmitting" class="btn-primary w-full">
            {{ isSubmitting ? 'Verificando...' : 'Entrar' }}
          </button>
        </form>

        <div class="pt-4 text-center">
          <p class="text-sm text-white/30 font-medium">
            ¿Nuevo en el club?
            <RouterLink to="/register" class="text-accent hover:text-white transition-colors">Solicitar Registro</RouterLink>
          </p>
        </div>
      </div>

      <!-- Demo Badge -->
      <div class="mt-8 p-4 bg-dark-100/50 border border-white/5 rounded-xl text-center">
        <p class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">Accesos rápidos para testeo</p>
        <div class="flex justify-center gap-4 text-[10px] font-mono text-white/40">
          <code class="bg-dark-200 px-2 py-1 rounded">passenger@taxigo.com</code>
          <code class="bg-dark-200 px-2 py-1 rounded">driver@taxigo.com</code>
        </div>
        <p class="text-[10px] text-white/20 mt-2 italic">* pass: password</p>
      </div>
    </div>
  </div>
</template>
