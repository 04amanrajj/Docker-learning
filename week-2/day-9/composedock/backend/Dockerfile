# STAGE 1: Compilation environment
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# STAGE 2: Hardened Runtime environment
FROM node:20-alpine AS runtime
ENV PORT=5000
ENV NODE_ENV=production
ENV DB_HOST=compose-db
ENV DB_PORT=5432

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /usr/src/app/app.js ./

# Switch to secure unprivileged system user
USER node
EXPOSE 5000
CMD ["node", "app.js"]
