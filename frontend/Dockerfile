# --- Étape 1 : build du React avec Node ---
FROM node:20-alpine AS build

WORKDIR /app

# URL de l'API injectée au build (Vite intègre les VITE_* dans le bundle)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Étape 2 : service statique léger avec Nginx ---
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
