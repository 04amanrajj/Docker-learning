# Frontend Static Server
FROM nginx:1.25-alpine

# Copy custom high-performance Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static frontend HTML/JS/CSS assets
COPY . /usr/share/nginx/html

# Remove the nginx.conf from the HTML dir so it is not served to clients
RUN rm -f /usr/share/nginx/html/nginx.conf /usr/share/nginx/html/Dockerfile

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
