FROM nginx:1.25-alpine

# Purge standard configs and replace with gateway configs
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/default.conf /etc/nginx/conf.d/

# Copy static frontend assets into standard html root
COPY frontend/index.html frontend/style.css /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
