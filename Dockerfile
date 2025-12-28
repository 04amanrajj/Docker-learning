# Step 1: Use an official lightweight Nginx image as the base
FROM nginx:alpine

# Step 2: Set the working directory inside the container (optional, but good practice)
WORKDIR /usr/share/nginx/html

# Step 3: Copy the local index.html file to the Nginx HTML directory inside the container
# This overwrites the default "Welcome to nginx!" page.
COPY index.html .

# Step 4: Expose port 80 so the container can receive web traffic on this port
EXPOSE 80

# Step 5: The default command to run when the container starts is already defined 
# in the official Nginx base image, so we don't strictly need to specify CMD.
# But here is what it does under the hood to start the Nginx server in the foreground:
# CMD ["nginx", "-g", "daemon off;"]
