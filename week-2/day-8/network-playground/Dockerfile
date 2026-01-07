# ===================================================
# STAGE 1: Dependency builder
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# ===================================================
# STAGE 2: Hardened secure runtime
# ===================================================
FROM node:20-alpine AS runtime

ENV PORT=3000
ENV NODE_ENV=production
ENV REDIS_HOST=cache-db
ENV REDIS_PORT=6379

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/app.js ./
COPY --from=builder /usr/src/app/public ./public

# Switch to secure non-root user privilege
USER node

EXPOSE 3000

CMD ["node", "app.js"]
