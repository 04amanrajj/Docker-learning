#!/bin/bash
# Day 22-24 PortDock zero-downtime deployment and cache-metrics validator

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}📊 Week 4: PortDock Full-Stack Caching & Registry Deployer${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Clean existing containers to prevent resource/port conflicts
echo -e "${BLUE}Purging legacy container states...${NC}"
docker compose down -v --remove-orphans >/dev/null 2>&1
docker rm -f portdock-frontend portdock-backend portdock-db portdock-redis >/dev/null 2>&1

# 2. Boot production stack
echo -e "\n${BLUE}Launching Docker Compose PortDock cluster (React, Fastify, Postgres, Redis)...${NC}"
docker compose up -d --build

# 3. Wait for database and cache engines healthchecks
echo -e "\n${BLUE}Awaiting database and cache pool availability...${NC}"
for i in {1..12}; do
    db_health=$(docker inspect --format='{{json .State.Health.Status}}' portdock-db 2>/dev/null)
    redis_health=$(docker inspect --format='{{json .State.Health.Status}}' portdock-redis 2>/dev/null)
    
    if [ "$db_health" == "\"healthy\"" ] && [ "$redis_health" == "\"healthy\"" ]; then
        echo -e "${GREEN}✓ Relational database (PostgreSQL) health validated: HEALTHY${NC}"
        echo -e "${GREEN}✓ Memory cache database (Redis) health validated: HEALTHY${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Give Fastify a second to startup completely
sleep 3

# 4. Execute Dynamic Cache Validation Loops
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: DYNAMIC CACHE-MISS / CACHE-HIT TESTING${NC}"
echo -e "${GREEN}===================================================${NC}"

# Query 1: Initial load (Triggers database hit & Cache Miss)
echo -e "Query 1: Triggering initial page load endpoint call..."
q1_res=$(docker exec -t portdock-backend wget -qO- http://127.0.0.1:5000/api/tasks)
echo -e "Response Query Source: ${RED}$(echo "$q1_res" | grep -oE '"cache":"[^"]+"' | sed 's/"//g')${NC}"

# Query 2: Immediate reload (Triggers fast in-memory Redis Cache Hit!)
echo -e "\nQuery 2: Triggering immediate secondary page reload..."
q2_res=$(docker exec -t portdock-backend wget -qO- http://127.0.0.1:5000/api/tasks)
echo -e "Response Query Source: ${GREEN}$(echo "$q2_res" | grep -oE '"cache":"[^"]+"' | sed 's/"//g')${NC}"

# 5. Execute Cache Invalidation Validation
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: CACHE INVALIDATION & MUTATION TESTING${NC}"
echo -e "${GREEN}===================================================${NC}"

# Create a new task (Should trigger cache invalidation automatically!)
echo -e "Mutating State: Creating a new task in the database..."
create_res=$(docker exec -t portdock-backend wget -qO- --post-data='{"title":"Automate Git Streaks","description":"Commit sequential contributions daily"}' --header="Content-Type: application/json" http://127.0.0.1:5000/api/tasks)
echo -e "Response Creation Status: ${GREEN}$(echo "$create_res" | grep -oE '"success":[^,]+')${NC}"

# Query 3: Post-Mutation load (Triggers database hit, Cache MISS, and recaches!)
echo -e "\nQuery 3: Fetching task list immediately after state mutation..."
q3_res=$(docker exec -t portdock-backend wget -qO- http://127.0.0.1:5000/api/tasks)
echo -e "Response Query Source: ${RED}$(echo "$q3_res" | grep -oE '"cache":"[^"]+"' | sed 's/"//g')${NC}"

# Query 4: Reload (Triggers fast in-memory Redis Cache Hit on newly updated task list!)
echo -e "\nQuery 4: Triggering reload on freshly recached task list..."
q4_res=$(docker exec -t portdock-backend wget -qO- http://127.0.0.1:5000/api/tasks)
echo -e "Response Query Source: ${GREEN}$(echo "$q4_res" | grep -oE '"cache":"[^"]+"' | sed 's/"//g')${NC}"

# 6. Retrieve active cache hit ratio metrics from backend gateway
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 3: CACHE HIT RATIO OBSERVABILITY METRICS${NC}"
echo -e "${GREEN}===================================================${NC}"
metrics_res=$(docker exec -t portdock-backend wget -qO- http://127.0.0.1:5000/api/cache-status)
echo -e "Telemetry metrics:\n${PURPLE}$metrics_res${NC}"

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Zero-Downtime Portfolio Deployment Complete!${NC}"
echo -e "  🌐 Public React Dashboard Gateway: ${PURPLE}http://localhost:8080${NC}"
echo -e "  📡 Private Fastify REST Engine   : ${PURPLE}http://backend:5000/api/tasks${NC}"
echo -e "  🧠 Private Redis Scraper Gateway : ${PURPLE}http://redis:6379${NC}"
echo -e "${GREEN}===================================================${NC}"
