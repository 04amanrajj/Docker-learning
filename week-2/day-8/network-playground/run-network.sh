#!/bin/bash
# Day 8 Bridge Networking Automation Orchestration

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🌐 Day 8: User-Defined Networks Orchestrator Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Create bridge network
echo -e "\n${BLUE}[1/5] Initializing custom User-Defined Bridge network (app-net)...${NC}"
if docker network inspect app-net >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Network 'app-net' already exists.${NC}"
else
    docker network create app-net >/dev/null
    echo -e "${GREEN}✓ Created custom bridge network app-net successfully.${NC}"
fi

# 2. Spin up isolated Redis database
echo -e "\n${BLUE}[2/5] Running isolated Redis container (no host ports exposed!)...${NC}"
if docker ps -a --format '{{.Names}}' | grep -Eq "^cache-db$"; then
    echo -e "${RED}Clean old database container...${NC}"
    docker stop cache-db >/dev/null 2>&1
    docker rm cache-db >/dev/null 2>&1
fi

docker run -d \
  --name cache-db \
  --network app-net \
  redis:7-alpine >/dev/null
echo -e "${GREEN}✓ Database container 'cache-db' is up and listening inside app-net.${NC}"

# 3. Build Web API image
echo -e "\n${BLUE}[3/5] Compiling Express backend multi-stage image...${NC}"
docker build -t network-playground .
echo -e "${GREEN}✓ Image compiled successfully.${NC}"

# 4. Boot Web API server connected to network
echo -e "\n${BLUE}[4/5] Running API server connected to bridge...${NC}"
if docker ps -a --format '{{.Names}}' | grep -Eq "^web-app$"; then
    echo -e "${RED}Clean old web application container...${NC}"
    docker stop web-app >/dev/null 2>&1
    docker rm web-app >/dev/null 2>&1
fi

docker run -d \
  --name web-app \
  --network app-net \
  -e REDIS_HOST=cache-db \
  -p 8080:3000 \
  network-playground >/dev/null
sleep 3 # wait for server listening socket

# 5. Query DNS API and active hits stats
echo -e "\n${BLUE}[5/5] Testing container-to-container DNS communication...${NC}"
dns_response=$(curl -s http://localhost:8080/api/network-status)
visits_response=$(curl -s http://localhost:8080/api/visits)

if [ $? -eq 0 ] && [ ! -z "$dns_response" ]; then
    echo -e "${GREEN}✓ Success! Docker DNS diagnostics resolved successfully:${NC}"
    echo -e "${PURPLE}$dns_response${NC}"
    echo -e "\n${GREEN}✓ Hits API response:${NC}"
    echo -e "${PURPLE}$visits_response${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 Day 8 Sandbox is Active!${NC}"
    echo -e "${GREEN}👉 Open your browser at: http://localhost:8080${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Network resolution test failed. Inspect logs with: docker logs web-app${NC}"
fi
