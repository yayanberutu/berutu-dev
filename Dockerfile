# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve
FROM caddy:2-alpine
WORKDIR /usr/share/caddy

# Copy static files from build stage
COPY --from=build /app/dist /usr/share/caddy

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
