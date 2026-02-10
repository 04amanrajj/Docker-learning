# Stage 1: Dependency Compiler
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci

# Stage 2: Runtime Sandbox
FROM node:20-alpine
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./
COPY . .

# Unprivileged user context
USER node

EXPOSE 5000
CMD ["node", "app.js"]
