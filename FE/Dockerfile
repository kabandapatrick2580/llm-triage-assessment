# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (cached unless lockfile changes)
COPY package*.json ./
RUN npm ci

# Build the app
COPY . .
# Optional: bake a backend base URL at build time. Leave empty to use the
# reverse proxy defined in nginx.conf (recommended).
ARG VITE_API_BASE_URL=""
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
