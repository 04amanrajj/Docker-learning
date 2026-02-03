# Serving static task-manager files with Nginx
FROM nginx:1.25-alpine

RUN rm /usr/share/nginx/html/*
COPY index.html style.css /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
