import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import App from './App.vue'
import '@/assets/styles/main.css'

async function bootstrap() {
    // Start MSW mock service worker in dev mode
    // Wrapped in try/catch — if MSW fails to load (e.g. Vite cache issue,
    // SW blocked), the app still mounts and works without mocks.
    if (import.meta.env.VITE_USE_MOCK === 'true') {
        try {
            const { worker } = await import('./mocks/browser')
            await worker.start({
                onUnhandledRequest: 'bypass',
                serviceWorker: {
                    url: '/mockServiceWorker.js',
                },
            })
            console.log('[MSW] Mock service worker started')
        } catch (e) {
            console.warn('[MSW] Could not start mock service worker:', e)
        }
    }

    const app = createApp(App)
    const pinia = createPinia()
    pinia.use(piniaPluginPersistedstate)

    app.use(pinia)
    app.use(router)

    app.mount('#app')
}

bootstrap().catch((e) => {
    console.error('[TaxiGo] Fatal error during bootstrap:', e)
})
