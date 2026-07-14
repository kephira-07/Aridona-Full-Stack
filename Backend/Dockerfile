#FROM node:18-alpine
# Use the official Node image for the backend so npm is available
FROM node:22-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

# You might need to change this if your package.json script is different (e.g., node server.js)
# Based on common setup, assuming npm start runs the server
CMD ["npm", "start"]
