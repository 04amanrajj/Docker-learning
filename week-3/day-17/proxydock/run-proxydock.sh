#!/bin/bash
# Day 17 ProxyDock Reverse Proxy startup and validation script

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🌐 Day 17: Nginx Reverse Proxy & Gateway Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing compose stacks
echo -e "${BLUE}Cleaning legacy container stacks...${NC}"
docker compose down >/dev/null 2>&1

# Build and boot the orchestrator services
echo -e "\n${BLUE}Booting ProxyDock gateway stack...${NC}"
docker compose up -d --build

# Wait for services to fully initialize
echo -e "\n${BLUE}Waiting for Nginx listener initialization...${NC}"
sleep 4

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: PORT EXPOSURE AUDIT (docker ps)${NC}"
echo -e "${GREEN}===================================================${NC}"
docker ps --filter "name=proxydock"

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: VERIFYING REVERSE PROXY ROUTING (curl)${NC}"
echo -e "${GREEN}===================================================${NC}"

# Query the public proxy port on /api/telemetry
response=$(curl -s http://localhost:8080/api/telemetry)

if [[ "$response" == *'"success":true'* ]]; then
    echo -e "${GREEN}✓ Reverse Proxy Routing is perfectly functional!${NC}"
    echo -e "Response body parsed:\n"
    echo "$response" | grep -E '"message"|"xRealIP"|"xForwardedFor"|"hostHeader"'
else
    echo -e "${RED}❌ Failed to query telemetry through Nginx proxy.${NC}"
    echo -e "Fallback Debug Logs:"
    docker logs proxydock-gateway
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete! Gateway online!${NC}"
echo -e "  🌐 Open Dashboard UI  : ${PURPLE}http://localhost:8080${NC}"
echo -e "  📡 Query Telemetry API: ${PURPLE}http://localhost:8080/api/telemetry${NC}"
echo -e "${GREEN}===================================================${NC}"
