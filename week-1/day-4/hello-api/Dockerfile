# Step 1: Start from the official lightweight Node.js alpine template
FROM node:20-alpine

# Step 2: Set the isolated working folder (Creates the folder if it doesn't exist)
WORKDIR /app

# Step 3: Copy package files first to optimize layer caching for node dependency installs
COPY package*.json ./

# Step 4: Run npm installation inside the isolated directory
RUN npm install

# Step 5: Copy the remaining source files into the container's app context folder
COPY . .

# Step 6: Expose port 3000 (Documents the container port to the Docker daemon network)
EXPOSE 3000

# Step 7: Launch the Express REST Server process on container boot
CMD ["node", "server.js"]
