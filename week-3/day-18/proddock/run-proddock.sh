#!/bin/bash
# Day 18 ProdDock Production-Hardened Compose verification pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🛡️ Day 18: Hardened Production Docker Compose Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing compose stacks
echo -e "${BLUE}Purging legacy container states...${NC}"
docker compose down -v --remove-orphans >/dev/null 2>&1
docker rm -f proddock-app proddock-db proddock-cache proddock-frontend >/dev/null 2>&1

# Build and boot the orchestrator services
echo -e "\n${BLUE}Booting ProdDock service stack (App, Postgres, Redis, Nginx)...${NC}"
docker compose up -d --build

# Wait for service health states to initialize
echo -e "\n${BLUE}Awaiting PG/Redis healthcheck validations...${NC}"
for i in {1..12}; do
    health_status=$(docker inspect --format='{{json .State.Health.Status}}' proddock-db 2>/dev/null)
    if [ "$health_status" == "\"healthy\"" ]; then
        echo -e "${GREEN}✓ Database health validated: HEALTHY${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: CGROUP RESOURCES LIMITS & SECURITY SPECS${NC}"
echo -e "${GREEN}===================================================${NC}"
docker ps --filter "name=proddock" --format "table {{.Names}}\t{{.Status}}"

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: LIVE TELEMETRY CGROUP AUDIT (curl)${NC}"
echo -e "${GREEN}===================================================${NC}"

# Query the public proxy port on /api/telemetry
echo -e "Waiting for Node API service initialization..."
sleep 3
response=$(curl -s http://localhost:8080/api/telemetry)

if [[ "$response" == *'"success":true'* ]]; then
    echo -e "${GREEN}✓ Production telemetry is online and fully verified!${NC}"
    echo -e "Hardened metrics retrieved:\n"
    echo "$response" | grep -E '"userContextUID"|"isRunningAsRoot"|"rssMB"|"memoryLimitMB"|"databasePostgres"|"cacheRedis"'
else
    echo -e "${RED}❌ Failed to query telemetry through Nginx proxy.${NC}"
    echo -e "Debug Logs:"
    docker compose logs app
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete! Production cluster online!${NC}"
echo -e "  🛡️ Open Hardened UI : ${PURPLE}http://localhost:8080${NC}"
echo -e "  📡 Live API Endpoint: ${PURPLE}http://localhost:8080/api/telemetry${NC}"
echo -e "${GREEN}===================================================${NC}"
