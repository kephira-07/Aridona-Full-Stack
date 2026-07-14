# Build stage
FROM node:22-bullseye-slim as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve stage
FROM nginx:stable-alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 inside the container
EXPOSE 80

# Nginx starts automatically
