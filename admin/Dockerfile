# Build stage
FROM node:22-bullseye-slim as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_BACKEND_URL=https://api.aridona.store
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN npm run build

# Serve stage
FROM docker.io/library/nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 inside the container
EXPOSE 80

# Nginx starts automatically
