# Stage 1: Dependency builder
FROM node:20-alpine AS deps

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime runner
FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Run under secure non-root unprivileged context
USER node

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "server.js"]
