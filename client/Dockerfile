# Build stage latest machine with node 22+
# Build stage
FROM node:22-bullseye-slim as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_BACKEND_URL=https://api.aridona.store
ARG VITE_GOOGLE_CLIENT_ID=150301338312-stgp473sf4mf2fnitnhlumb148oafjs0.apps.googleusercontent.com
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN npm run build

# Serve stage
FROM docker.io/library/nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 inside the container
EXPOSE 80

# Nginx starts automatically
