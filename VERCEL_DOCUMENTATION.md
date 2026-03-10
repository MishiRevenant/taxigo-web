# TaxiGo: Documentación Técnica y Despliegue en Vercel

Esta documentación describe la arquitectura técnica de **TaxiGo**, sus requerimientos actuales para funcionar localmente, y la ruta exacta para llevar a producción el frontend y el backend, con un enfoque especial en el despliegue del Frontend mediante Vercel.

---

## 🏗 Arquitectura del Sistema

El proyecto está dividido en dos aplicaciones principales que interactúan entre sí:
1. **Frontend (SPA - Single Page Application)**: Desarrollado con Vue 3, Vite, y TailwindCSS.
2. **Backend (API REST)**: Desarrollado con Node.js, Express, TypeScript, JWT (Autenticación), y SQLite (Base de datos local).

### Componentes Técnicos
- **Estado Global:** Pinia (Persistencia con LocalStorage).
- **Manejo de Mapas:** Leaflet.
- **Validación de Formularios:** VeeValidate + Zod.
- **Base de Datos API:** `better-sqlite3` que genera archivos persistentes locales (`taxigo.db`, `taxigo.db-wal`, `-shm`).

---

## 💻 Entorno Local (Origen Actual)

Actualmente, ambos componentes están corriendo en entorno local y se comunican a través de los puertos definidos:
- **Frontend Vite:** `http://localhost:5173` (o el que Vite asigne).
- **Backend API:** `http://localhost:3000`.

### Requisitos previos:
- Node.js (v20 o superior recomendado).
- `.env` configurado en el Frontend (`VITE_API_URL=http://localhost:3000/api`).
- `.env` configurado en el Backend (`PORT=3000`, `JWT_SECRET=tu_secreto`, etc).
- Levantar backend: `npm run dev` en `taxigo-api`.
- Levantar frontend: `npm run dev` en `taxigo-web`.

---

## 🚀 Estrategia de Despliegue

### 1. El Reto de Vercel y SQLite
**Vercel** es la plataforma ideal para la aplicación web (Frontend), pero **no es compatible con bases de datos locales basadas en archivos (SQLite)** porque su sistema de archivos es efímero y de solo-lectura (Serverless Functions). 
Por lo tanto, la estrategia definitiva es:
- **Frontend (`taxigo-web`)**: Despliegue en Vercel (Gratis, rápido y automatizado).
- **Backend (`taxigo-api`) y Base de Datos**: Despliegue en Render, Railway o Fly.io, donde se cuenta con un disco persistente (o en su defecto, migrar de SQLite a PostgreSQL alojado como Supabase/Neon).

---

## ⚙️ Preparación para Vercel (Frontend - `taxigo-web`)

Para que el frontend funcione correctamente como SPA en Vercel sin errores de "404 Not Found" al recargar, la aplicación cuenta ya con su archivo fundamental: `vercel.json`.

### 1. Validación de Archivos del Frontend
La aplicación ya cuenta con:
- `vercel.json`: Reglas de reescritura para atrapar cualquier ruta (`/(.*)`) y redirigirla a `index.html` delegando el ruteo a Vue-Router, así como políticas de Cache eficientes de los Assets que Vite genera.
- `vite.config.ts`: Preparado para el Build de producción.

### 2. Pasos para Activar el Despliegue en Vercel

1. **Subir tu código a GitHub/GitLab:** Sube las carpetas del proyecto a un repositorio (puedes crear un **monorepo** o dos repositorios distintos: `taxigo-web` y `taxigo-api`). 
2. **Ir a Vercel:** Accede a [vercel.com](https://vercel.com) e inicia sesión con Github.
3. **Crear Nuevo Proyecto (`Add New -> Project`):**
   - Importa el repositorio donde guardaste `taxigo-web`.
   - Si es un monorepo, define la opción **Root Directory** seleccionando la carpeta `taxigo-web`.
   - **Framework Preset:** Vercel detectará automáticamente que es `Vite`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables (Variables de Entorno) - ¡MUY IMPORTANTE!:**
   - Name: `VITE_API_URL`
   - Value: `https://URL_DE_TU_API_AQUI.com/api` (Reemplaza con la dirección donde alojarás el Backend).
5. **Clic en "Deploy"**: Vercel tomará la configuración, instalará las dependencias y dejará el Frontend publicado.

---

## ☁️ Despliegue del Backend (`taxigo-api`)

Dado que utilizas `better-sqlite3`, **tienes 2 opciones reales y técnicas:**

### Opción A (Recomendada y Rápida): Desplegar en Render
[Render.com](https://render.com) permite correr tu servidor Express conectando un "Disco Persistente" (Disk) para que el archivo `taxigo.db` sobreviva a los reinicios.
1. Sube `taxigo-api` a GitHub.
2. Crea un nuevo **Web Service** en Render.
3. En las configuraciones:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - Conecta un volumen a la ruta `./dist/db` o donde guardes tu BD local.
   - Configura las Environment Variables (`JWT_SECRET`, `PORT=10000`, `CORS_ORIGIN=la-url-de-tu-vercel.app`).

### Opción B (Productiva y Escalable): Migrar a Turso/Postgres
Si de todos modos deseas desplegar el backend en un entorno totalmente serverless (como el propio Vercel Functions o Railway):
Deberás reemplazar `better-sqlite3` por una base de datos en la nube (ej: Supabase para PostgreSQL, o Turso para SQLite remoto). 

---

## 🔒 Listado de Revisión Final (Checklist)
Antes de subir tu código:
- [ ] Eliminar cualquier rastro de contraseñas de los archivos (usar solo `.env.example` en lugar de subir el `.env`).
- [ ] Asegurarte de que el `cors` del Backend en el archivo `index.ts` u `app.ts` de la API acepte la URL de Vercel.
      `(origin: process.env.CORS_ORIGIN || '*')`
- [ ] En la configuración de Vite, tus llamadas a API se hacen utilizando la variable global `import.meta.env.VITE_API_URL` para referenciar la API desplegada, y no `http://localhost`.
