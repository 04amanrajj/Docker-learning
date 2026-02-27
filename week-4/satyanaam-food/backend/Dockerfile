# Build Stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies if needed (e.g., bcrypt might require native build tools)
RUN apk add --no-cache make gcc g++ python3

# Copy dependencies manifest
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Production Runner Stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy production node_modules and built dependencies
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Copy application source code
COPY . .

# Set dynamic production environment variables
ENV NODE_ENV=production
ENV PORT=4500

# Use secure unprivileged non-root node execution user
USER node

EXPOSE 4500

CMD ["node", "index.js"]
