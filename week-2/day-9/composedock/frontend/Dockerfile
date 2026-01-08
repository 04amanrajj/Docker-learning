# Production static web server Stage using Nginx Alpine
FROM nginx:1.25-alpine

# Remove default Nginx welcome configuration
RUN rm /usr/share/nginx/html/*

# Copy local frontend styles and index pages to Nginx html directory
COPY index.html style.css /usr/share/nginx/html/

# Expose standard Nginx port
EXPOSE 80

# Start Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"]
