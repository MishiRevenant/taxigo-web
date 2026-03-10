# Multi-stage build: Node 20 Alpine for build, Nginx Alpine for serving
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage Docker cache)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copy source and build
COPY . .
RUN npm run build

# ── Production Stage ─────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user for security
RUN addgroup -g 101 -S nginx-app && \
    adduser -u 101 -S -G nginx-app nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx

EXPOSE 80

LABEL maintainer="TaxiGo Team"
LABEL description="TaxiGo Web SPA – Vue 3 + TypeScript"

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
