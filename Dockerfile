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
FROM node:22-alpine
WORKDIR /app

# Copy built files and dependencies
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/drizzle.config.ts ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/src/db ./src/db

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV HOST=0.0.0.0
ENV PORT=80

EXPOSE 80
CMD ["node", "./dist/server/entry.mjs"]
