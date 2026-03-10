# 🚖 TaxiGo Web

> SPA de taxi premium construida con **Vue 3 + Vite + TypeScript + Tailwind CSS**  
> Se conecta al backend [taxigo-api](../taxigo-api) (Express + SQLite)

---

## 🛠 Tecnologías

| Herramienta | Versión | Uso |
|---|---|---|
| [Vue 3](https://vuejs.org) | ^3.4 | Framework SPA (Composition API + `<script setup>`) |
| [Vite](https://vitejs.dev) | ^5.2 | Bundler / Dev server |
| [TypeScript](https://typescriptlang.org) | ^5.4 | Tipado estático |
| [Pinia](https://pinia.vuejs.org) | ^2.1 | Gestión de estado global |
| [Vue Router](https://router.vuejs.org) | ^4.3 | SPA routing con guards |
| [Tailwind CSS](https://tailwindcss.com) | ^3.4 | Estilos utilitarios |
| [Vee-Validate + Zod](https://vee-validate.logaretm.com) | ^4.15 | Validación de formularios |
| [Axios](https://axios-http.com) | ^1.6 | Cliente HTTP con interceptores JWT |
| [Leaflet](https://leafletjs.com) | ^1.9 | Mapas interactivos (OpenStreetMap) |

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js ≥ 18
- [`taxigo-api`](../taxigo-api) corriendo en `http://localhost:8000`

### Pasos

```bash
cd taxigo-web
npm install
cp .env.example .env   # ajustar si el backend corre en otro host
npm run dev
# → http://localhost:5173
```

---

## ⚙️ Variables de Entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | URL base del backend |
| `VITE_APP_TITLE` | `TaxiGo Web` | Título de la pestaña |
| `VITE_USE_MOCK` | `false` | `true` activa MSW (sin backend real) |

---

## 👤 Usuarios de Prueba

| Rol | Email | Contraseña |
|---|---|---|
| 🧍 Pasajero | `passenger@taxigo.com` | `password` |
| 🚗 Conductor | `driver@taxigo.com` | `password` |

---

## 🗺️ Rutas de la Aplicación

| Ruta | Guard | Descripción |
|---|---|---|
| `/login` | Invitado | Formulario de acceso |
| `/register` | Invitado | Alta de cuenta |
| `/passenger/dashboard` | Auth + Pasajero | Panel + historial |
| `/passenger/request` | Auth + Pasajero | Solicitar nuevo viaje |
| `/passenger/trip` | Auth + Pasajero | Monitor del viaje activo |
| `/passenger/history` | Auth + Pasajero | Historial completo |
| `/driver/dashboard` | Auth + Conductor | Panel + viajes disponibles |
| `/driver/trip` | Auth + Conductor | Control del viaje en curso |
| `/driver/history` | Auth + Conductor | Historial de servicios |

**Guards:**
- `authGuard` — redirige a `/login` si no autenticado
- `guestGuard` — redirige al dashboard si ya tiene sesión
- `roleGuard('passenger'|'driver')` — redirige al dashboard correcto si el rol no coincide

---

## 🔄 Flujo de Estados

```
requested → accepted → on_ride → completed
    ↓           ↓
 cancelled   cancelled
```

El store de Pinia hace **polling cada 5 segundos** al endpoint `/trips/active` para actualizar el estado en tiempo real (sin WebSockets requeridos).

---

## 🏗 Arquitectura del Proyecto

```
src/
├── assets/styles/        # CSS global (variables, clases utilitarias)
├── components/           # Componentes reutilizables
│   ├── AppHeader.vue            # Nav + logout + badge de rol
│   ├── MapComponent.vue         # Mapa Leaflet (origen → destino)
│   ├── TripCard.vue             # Tarjeta de viaje (driver dashboard)
│   ├── TripStatusBadge.vue      # Pill de estado (requested/accepted/...)
│   ├── TripStatusStepper.vue    # Barra de progreso del viaje
│   ├── ToastNotification.vue    # Notificaciones flotantes
│   └── LoadingSpinner.vue       # Spinner animado
├── composables/
│   └── useToast.ts              # Composable global de toasts
├── layouts/
│   └── AppLayout.vue            # Layout con header + slot de contenido
├── mocks/                       # MSW mock handlers (dev sin backend)
├── router/
│   ├── index.ts                 # Definición de rutas (lazy-loaded)
│   └── guards.ts                # authGuard / guestGuard / roleGuard
├── services/
│   ├── api.ts                   # Instancia Axios + interceptores JWT/refresh
│   ├── auth.service.ts          # login / register / logout / getMe
│   └── trip.service.ts          # requestTrip / acceptTrip / updateStatus / ...
├── stores/                      # Pinia stores
│   ├── auth.ts                  # Sesión de usuario (persistido en localStorage)
│   ├── trip.ts                  # Viaje actual + polling automático
│   └── history.ts               # Historial de viajes (cache de 30 seg)
├── types/index.ts               # Interfaces TypeScript compartidas
└── views/
    ├── auth/         # LoginView, RegisterView
    ├── passenger/    # DashboardView, RequestTripView, ActiveTripView, HistoryView
    └── driver/       # DashboardView, ActiveTripView, HistoryView
```

---

## 🔐 Autenticación JWT

El cliente implementa **refresh automático de tokens**:

1. Cada request incluye `Authorization: Bearer <accessToken>`
2. Si la API devuelve `401` el interceptor intenta renovar el token via `POST /auth/refresh`
3. Si el refresh falla se limpia la sesión y se redirige a `/login`
4. Las requests paralelas que fallen durante el refresh se ponen en cola y se reintentan con el nuevo token

---

## 🐳 Docker

```bash
# Build imagen (Nginx, puerto 80)
npm run docker:build

# Ejecutar en puerto 3000
npm run docker:run

# Full stack con docker-compose (API + Web)
docker-compose up -d
```

El `nginx.conf` incluido reenvía `/api/` al servicio `taxigo-api`.

---

## ☁️ Despliegue en Vercel

El `vercel.json` ya tiene los rewrites para SPA configurados:

```bash
npm i -g vercel
vercel --prod
```

Configurar en Vercel → Settings → Environment Variables:
- `VITE_API_BASE_URL` → URL de producción del backend

---

## 🧪 Scripts

```bash
npm run dev           # Servidor de desarrollo (HMR)
npm run build         # Build de producción (vue-tsc + vite)
npm run preview       # Preview del build localmente
npm run type-check    # Verificación TypeScript sin build
npm run lint          # ESLint con autofix
```
