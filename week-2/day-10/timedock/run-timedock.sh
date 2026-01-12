#!/bin/bash
# Day 10 TimeDock Orchestration Pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}⏱️ Day 10: TimeDock Multi-Container Compose Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# Check for existing containers
echo -e "${BLUE}Cleaning legacy resources...${NC}"
docker compose down >/dev/null 2>&1

# Build and launch stack
echo -e "\n${BLUE}Compiling and starting Nginx, Node, and PostgreSQL stack...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! All three services launched successfully.${NC}"
    echo -e "${GREEN}✓ Port Mappings:${NC}"
    echo -e "  - Frontend Web UI : ${PURPLE}http://localhost:8081${NC}"
    echo -e "  - Express API REST: ${PURPLE}http://localhost:5001${NC}"
    echo -e "  - PostgreSQL RelDB: ${PURPLE}localhost:5433${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 TimeDock Sandbox is fully functional!${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Orchestration boot failed. Inspect stderr logs above.${NC}"
fi
