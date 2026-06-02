<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import ToastNotification from '@/components/ToastNotification.vue'
import { useAuthStore } from '@/stores/auth'
import { useSocket } from '@/composables/useSocket'

const authStore = useAuthStore()
const { connectSocket, disconnectSocket } = useSocket()

// Connect WebSocket when authenticated, disconnect when logged out
onMounted(() => {
    if (authStore.isAuthenticated) {
        connectSocket()
    }
})

watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
        connectSocket()
    } else {
        disconnectSocket()
    }
})
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Transition name="page" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </RouterView>
  <ToastNotification />
</template>
