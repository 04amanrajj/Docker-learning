#!/bin/bash
# Day 11 RediPoll Orchestrator Pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}⚡ Day 11: RediPoll Multi-Container Compose Caching Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean up existing nodes
echo -e "${BLUE}Isolating previous networks...${NC}"
docker compose down >/dev/null 2>&1

# Build and start services
echo -e "\n${BLUE}Compiling and starting Nginx, Node, and Redis services...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! All three services are running.${NC}"
    echo -e "${GREEN}✓ Port Allocations:${NC}"
    echo -e "  - Polling Web UI : ${PURPLE}http://localhost:8082${NC}"
    echo -e "  - Express API    : ${PURPLE}http://localhost:5002${NC}"
    echo -e "  - Redis Memory   : ${PURPLE}redipoll-cache:6379 (Isolated)${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 RediPoll sandbox cache pipeline is active!${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Deployment failed. Check Compose logs for details.${NC}"
fi
