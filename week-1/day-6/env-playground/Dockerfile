# Day 6 environment playground Dockerfile
FROM node:20-alpine

# Set working directory inside container
WORKDIR /usr/src/app

# Copy dependency configs and install
COPY package*.json ./
RUN npm install --only=production

# Copy application files
COPY app.js ./

# Define built-in robust environment defaults
# These can be overridden dynamically at boot time without rebuilding!
ENV PORT=3000
ENV APP_ENV=production
ENV WELCOME_MESSAGE="Hello from built-in Dockerfile ENV defaults! 🐋"
ENV THEME_COLOR=#0db7ed
ENV DB_HOST=localhost

# Expose dynamic listening port
EXPOSE 3000

# Start server process
CMD ["node", "app.js"]
