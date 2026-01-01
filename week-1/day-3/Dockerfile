# Step 1: Base Image (Defines the starting Operating System template)
FROM ubuntu:24.04

# Step 2: Environment variables (Keep installation silent and non-interactive)
ENV DEBIAN_FRONTEND=noninteractive

# Step 3: Run instruction (Installs developmental packages & cleans log caches)
RUN apt-get update && apt-get install -y \
    git \
    htop \
    curl \
    neofetch \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Working Directory (Sets context folder for all subsequent files)
WORKDIR /workspace

# Step 5: Copy instruction (Injects files from host computer into container layer)
COPY welcome.sh .
RUN chmod +x welcome.sh

# Step 6: Command instruction (Defines standard executable process at container startup)
CMD ["./welcome.sh"]
