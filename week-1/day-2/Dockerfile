# Step 1: Use the official lightweight Ubuntu LTS base image
FROM ubuntu:24.04

# Step 2: Set non-interactive mode for installation
ENV DEBIAN_FRONTEND=noninteractive

# Step 3: Install core tools (curl, procps for top/ps, iproute2)
RUN apt-get update && apt-get install -y \
    curl \
    procps \
    iproute2 \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Create a dedicated learning directory
WORKDIR /sandbox

# Step 5: Copy the welcome script into the container and make it executable
COPY welcome.sh .
RUN chmod +x welcome.sh

# Step 6: When the container starts, execute the welcome script
CMD ["./welcome.sh"]
