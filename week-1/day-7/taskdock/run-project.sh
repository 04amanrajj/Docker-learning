#!/bin/bash
# TaskDock Capstone Orchestrator Shell Script

# Set terminal formats
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🐳 Day 7 Capstone Project: Orchestrator Shell Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Allocate Docker volume
echo -e "\n${BLUE}[1/5] Initializing persistent Docker named volume...${NC}"
if docker volume inspect taskdock-vol >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Named volume 'taskdock-vol' already allocated.${NC}"
else
    docker volume create taskdock-vol >/dev/null
    echo -e "${GREEN}✓ Created new virtual persistent volume: taskdock-vol${NC}"
fi

# 2. Build multi-stage optimized image
echo -e "\n${BLUE}[2/5] Compiling secure multi-stage container image...${NC}"
docker build -t taskdock .
echo -e "${GREEN}✓ Compilation completed. Image 'taskdock' built successfully.${NC}"

# 3. Handle active server process cleanup
echo -e "\n${BLUE}[3/5] Cleaning up old container processes if active...${NC}"
if docker ps -a --format '{{.Names}}' | grep -Eq "^taskdock-app$"; then
    echo -e "${RED}Stopping and removing existing 'taskdock-app' instance...${NC}"
    docker stop taskdock-app >/dev/null
    docker rm taskdock-app >/dev/null
fi
echo -e "${GREEN}✓ Clean runtime sandbox slot ready.${NC}"

# 4. Boot hardened container daemon
echo -e "\n${BLUE}[4/5] Launching hardened Node container (USER node)...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✓ Found local .env file. Loading configuration overrides.${NC}"
    docker run -d \
      --name taskdock-app \
      --env-file .env \
      -v taskdock-vol:/data \
      -p 8080:3000 \
      taskdock
else
    echo -e "${PURPLE}No .env file found. Booting with default image environmental configurations...${NC}"
    docker run -d \
      --name taskdock-app \
      -v taskdock-vol:/data \
      -p 8080:3000 \
      taskdock
fi
sleep 2 # await server process listening socket

# 5. Query dynamic diagnostics API
echo -e "\n${BLUE}[5/5] Testing container health diagnostics endpoint...${NC}"
response=$(curl -s http://localhost:8080/api/diagnostics)

if [ $? -eq 0 ] && [ ! -z "$response" ]; then
    echo -e "${GREEN}✓ Connection verified! Diagnostics JSON output:${NC}"
    echo -e "${PURPLE}$response${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 CONGRATULATIONS! CAPSTONE PORTAL IS LIVE!${NC}"
    echo -e "${GREEN}👉 Open your browser at: http://localhost:8080${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}⚠️ Diagnostics check failed. Inspect logs using: docker logs taskdock-app${NC}"
fi
