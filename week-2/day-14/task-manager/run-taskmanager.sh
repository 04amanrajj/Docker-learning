#!/bin/bash
# Day 14 Task Manager Orchestration Pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🚀 Day 14 Capstone: High-Performance Task Manager Stack${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing container
echo -e "${BLUE}Cleaning older task-manager stacks...${NC}"
docker compose down >/dev/null 2>&1

# Build and start services
echo -e "\n${BLUE}Compiling and starting Nginx, Fastify, Postgres, and Redis cache cluster...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! All container clusters are booted successfully.${NC}"
    echo -e "${GREEN}✓ Exposed Interfaces:${NC}"
    echo -e "  - Workspace Client UI : ${PURPLE}http://localhost:8080${NC}"
    echo -e "  - Fastify API Service  : ${PURPLE}http://localhost:5000/api/diagnostics${NC}"
    echo -e "  - Postgres DB Socket  : ${PURPLE}localhost:5432${NC}"
    echo -e "  - Redis Cache Cluster : ${PURPLE}localhost:6379 (Internal Bridge Only)${NC}"
    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 Task Manager environment is active!${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Orchestration bootstrapping failed. Verify Compose specs.${NC}"
fi
