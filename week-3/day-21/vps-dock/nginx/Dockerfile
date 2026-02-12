FROM nginx:1.25-alpine

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
