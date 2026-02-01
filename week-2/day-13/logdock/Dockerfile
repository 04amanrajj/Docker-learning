# Lightweight production logging engine
FROM node:20-alpine

# Hardened unprivileged app environment
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Setup secure directory permissions for unprivileged node user
RUN mkdir -p logs && chown -R node:node logs

USER node

CMD ["node", "app.js"]
