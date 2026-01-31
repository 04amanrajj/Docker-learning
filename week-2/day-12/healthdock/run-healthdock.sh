#!/bin/bash
# Day 12 Healthdock Orchestration Pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🩺 Day 12: Healthdock Multi-Container Healthcheck Sandbox${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean up existing nodes
echo -e "${BLUE}Cleaning legacy resources...${NC}"
docker compose down >/dev/null 2>&1

# Build and start services
echo -e "\n${BLUE}Compiling and starting Nginx, Node, and Postgres cluster...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! All three services are running.${NC}"
    echo -e "${GREEN}✓ Port Allocations:${NC}"
    echo -e "  - Diagnostics UI : ${PURPLE}http://localhost:8080${NC}"
    echo -e "  - Health API     : ${PURPLE}http://localhost:5000/health${NC}"
    echo -e "  - PostgreSQL DB  : ${PURPLE}localhost:5432${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 Healthdock sandbox is operational!${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Deployment failed. Check Compose logs for details.${NC}"
fi
