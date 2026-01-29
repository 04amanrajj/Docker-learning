# STAGE 1: Compilation environment
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# STAGE 2: Hardened secure runtime
FROM node:20-alpine AS runtime
ENV PORT=5000
ENV NODE_ENV=production
ENV REDIS_HOST=redipoll-cache
ENV REDIS_PORT=6379

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/app.js ./

# Enforce secure non-root user execution
USER node
EXPOSE 5000
CMD ["node", "app.js"]
