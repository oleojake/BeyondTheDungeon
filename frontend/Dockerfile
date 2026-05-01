# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG VITE_HCAPTCHA_SITE_KEY

RUN printf "VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\nVITE_API_URL=%s\nVITE_BACKEND_URL=%s\nVITE_HCAPTCHA_SITE_KEY=%s\n" \
    "$VITE_SUPABASE_URL" "$VITE_SUPABASE_ANON_KEY" "$VITE_API_URL" "$VITE_BACKEND_URL" "$VITE_HCAPTCHA_SITE_KEY" > .env \
 && echo "=== DEBUG ===" && echo "HCAPTCHA='${VITE_HCAPTCHA_SITE_KEY}'" && cat .env

RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Custom nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
