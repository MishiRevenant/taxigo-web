# TaxiGo: Documentación Técnica y Despliegue en Vercel

Esta documentación describe la arquitectura **SERVERLESS DE PRODUCCIÓN** técnica de **TaxiGo**, sus requerimientos actuales para funcionar y la ruta exacta, paso a paso, para desplegar el frontend y el backend en Vercel de forma integral utilizando **PostgreSQL** y **Supabase** como base de datos externa.

---

## 🏗 Arquitectura del Sistema Funcional
El proyecto fue migrado de su estado de desarrollo inicial (SQLite) a una infraestructura Full-Stack Serverless madura:

1. **Frontend (SPA)**: `taxigo-web` (Vue 3, Pinia, TailwindCSS). Alojado en Vercel.
2. **Backend (API REST Serverless)**: `taxigo-api` (Express, PostgreSQL, JWT). Transpilado en vuelo mediante `vercel.json` y alojado como funciones nativas de Vercel (Edge/Serverless).
3. **Database (Cloud Data)**: PostgreSQL alojado en Supabase / Neon con conexión Segura IPv4 y SSL forzado por código para entornos Vercel.

---

## 💻 Entorno Local
Actualmente, ambos componentes pueden seguir corriendo en entorno local y se comunican a través de los puertos definidos:
- **Frontend Vite:** `http://localhost:5173`.
- **Backend API:** `http://localhost:8000`.

### Requisitos previos:
- `.env` configurado en el Frontend (`VITE_API_URL=http://localhost:8000/api`).
- `.env` configurado en el Backend:
  ```env
  PORT=8000
  DATABASE_URL=postgres://[USERNAME]:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
  JWT_ACCESS_SECRET=tu_secreto_access
  JWT_REFRESH_SECRET=tu_secreto_refresh
  CORS_ORIGIN=http://localhost:5173
  NODE_ENV=development
  ```
- Levantar base de datos inicial (*Seed*): `npm run seed` en la carpeta `taxigo-api`.
- Levantar servicios en paralelo con `npm run dev`.

---

## 🚀 Guía Exacta de Despliegue (Producción en Vercel)

Para que el ecosistema funcione correctamente, **debes subir primero la API y luego el Frontend**, ya que el Frontend necesita saber la URL de tu API para comunicarse con la base de datos de producción.

### PASO 1: Subir la API (`taxigo-api`) a Vercel

1. **Subir a GitHub**: Asegúrate de que `taxigo-api` (con su propio `package.json` y el archivo de ruteo `vercel.json`) esté subido a un repositorio de GitHub. 
2. **Crear Proyecto Vercel**: En `vercel.com`, haz clic en **Add New -> Project**.
3. **Seleccionar Repo**: Escoge el repositorio de tu API.
4. **Build Settings**: 
   - Vercel la autodetectará con base en el `package.json`. Asegúrate de que detecte el **Build Command** como `npm run build` y el **Output Directory** como `dist`.
5. **Variables de Entorno (Environment Variables)**: (OBLIGATORIO) 
   Debes introducir los mismos valores de tu `.env` pero en Vercel (¡Sin ponerles comillas!")
   - `DATABASE_URL`: tu cadena IPv4 de Supabase (`postgres://...`)
   - `JWT_ACCESS_SECRET`: `tu_clave_secreta_1`
   - `JWT_REFRESH_SECRET`: `tu_clave_secreta_2`
   - *Nota: Todavía no pongas `CORS_ORIGIN`.*
6. Haz clic en **Deploy**. 

Al finalizar, copia la URL que Vercel te otorga para tu dominio (ej. `https://api-taxigo-123.vercel.app`). Pruébala visitando `[TU_URL_VERCEL]/health`. Si responde con `{"status":"ok"}`, tu Backend ya vive y respira en la nube.

---

### PASO 2: Subir el Frontend (`taxigo-web`) a Vercel

1. **Crear Proyecto Vercel** para tu Frontend (**Add New -> Project**).
2. **Seleccionar Repo**: Escoge el repositorio de código `taxigo-web`.
3. **Variables de Entorno**: (CRÍTICO)
   - Agrega la variable `VITE_API_URL`
   -  Pega el valor de la URL de tu backend que obtuviste en el paso 1, añadiendo `/api` al final *(ej. `https://api-taxigo-123.vercel.app/api`)*.
4. Haz clic en **Deploy**.

Vercel te dará la URL web para los pasajeros y choferes. (ej. `https://web-taxigo-xyz.vercel.app`).
**Cópiala**.

---

### PASO 3: Enlace de Seguridad (CORS)

Express bloquea por defecto a cualquier página extraña intentando robar tus datos. Le debemos decir a tu API que el Frontend que creaste de Vercel es 100% de confianza.

1. Regresa al Dashboard del Proyecto de la **API**.
2. Entra a **Settings -> Environment Variables**.
3. Añade la variable `CORS_ORIGIN`.
4. Pega la **URL final de tu Aplicación Web** obtenida hace un minuto.
5. Vuelve arriba a la pestaña **Deployments**, pulsa los 3 puntos verticales junto a tu despliegue más reciente y escoge **Redeploy** para aplicar los cambios de confianza entre ambos servidores.

### 🎉 ¡SISTEMA ONLINE FUNCIONAL! 🎉
