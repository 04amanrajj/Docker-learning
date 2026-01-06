# ===================================================
# STAGE 1: Builder environment
# ===================================================
FROM node:20-alpine AS builder

# Set build directory
WORKDIR /usr/src/app

# Copy dependency mappings
COPY package*.json ./

# Install development & compilation dependencies
RUN npm ci

# Copy application codes
COPY . .

# ===================================================
# STAGE 2: Hardened Runtime environment
# ===================================================
FROM node:20-alpine AS runtime

# Secure runtime defaults
ENV PORT=3000
ENV NODE_ENV=production
ENV APP_OWNER=Aman
ENV THEME_GLOW=#0db7ed
ENV DB_FILE_PATH=/data/tasks.json

# Allocate secure sandbox storage path inside container
WORKDIR /usr/src/app

# Copy production package mapping and clean install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled resources and static assets from builder
COPY --from=builder /usr/src/app/app.js ./
COPY --from=builder /usr/src/app/public ./public

# Set permissions for secure non-root user execution
# SQLite/file database requires write access on both the /data path and the database file.
# Create data dir, assign ownership to Node non-root user, and set permissions.
USER root
RUN mkdir -p /data && chown -R node:node /data && chmod -R 775 /data

# Switch to standard unprivileged Node user
USER node

# Expose dynamic listening port
EXPOSE 3000

# Boot taskboard server daemon
CMD ["node", "app.js"]
