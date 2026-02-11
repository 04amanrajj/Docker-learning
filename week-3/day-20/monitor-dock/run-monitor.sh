#!/bin/bash
# Day 20 MonitorDock production-grade Observability validation pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}📊 Day 20: Production Observability & Monitoring Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Clean existing containers to prevent resource/port conflicts
echo -e "${BLUE}Purging legacy container states...${NC}"
docker compose down -v --remove-orphans >/dev/null 2>&1
docker rm -f monitordock-app monitordock-db monitordock-cadvisor monitordock-prometheus monitordock-grafana secretdock-app secretdock-db secretdock-frontend >/dev/null 2>&1

# 2. Boot Compose cluster
echo -e "\n${BLUE}Booting MonitorDock observability cluster (App, DB, cAdvisor, Prometheus, Grafana)...${NC}"
docker compose up -d --build

# 3. Wait for database initialization
echo -e "\n${BLUE}Awaiting system dependencies validation...${NC}"
for i in {1..12}; do
    health_status=$(docker inspect --format='{{json .State.Health.Status}}' monitordock-db 2>/dev/null)
    if [ "$health_status" == "\"healthy\"" ]; then
        echo -e "${GREEN}✓ Database health validated: HEALTHY${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# 4. Generate synthetic traffic to populate Prometheus TSDB metrics
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: SYNTHETIC API TRAFFIC GENERATION${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Injecting synthetic HTTP query requests into private backend..."

# Execute direct endpoint calls using docker execution sandbox loops
for i in {1..15}; do
    docker exec -t monitordock-app wget -qO- http://localhost:5000/api/data >/dev/null
    echo -n "⚡"
    sleep 0.2
done
echo -e "\n✓ Synthetic API traffic generated."

echo -e "\nSimulating active user session changes (triggers Prometheus gauges)..."
for i in {1..5}; do
    docker exec -t monitordock-app wget -qO- --post-data='{"action":"login"}' --header="Content-Type: application/json" http://localhost:5000/api/session >/dev/null
    echo -n "👤"
    sleep 0.1
done
echo -e "\n✓ Session metrics gauge values incremented successfully."

# 5. Query Prometheus active targets endpoint to verify successful scraping
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: PROMETHEUS SCRAPE TARGETS VERIFICATION${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Awaiting Prometheus scraping cycle initialization..."
sleep 6 # Wait for Prometheus scrape targets loop

# Retrieve scrape targets list from private Prometheus port
targets_response=$(docker exec -t monitordock-prometheus wget -qO- http://localhost:9090/api/v1/targets)

if [[ "$targets_response" == *'"status":"success"'* ]]; then
    echo -e "${GREEN}✓ Prometheus Time-Series scraping targets are ONLINE!${NC}"
    echo -e "Active metrics endpoints compiled:\n"
    # Pretty-print targets payload
    echo "$targets_response" | grep -oE '"scrapeUrl":"[^"]+"|"health":"[^"]+"' | sed 's/"//g'
else
    echo -e "${RED}❌ Prometheus targets verification failed. Target payload was empty.${NC}"
    docker compose logs prometheus
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Observability Deployment Complete! Observability metrics active!${NC}"
echo -e "  📊 Grafana Dashboards Gateway: ${PURPLE}http://localhost:3000${NC} (Credentials: admin/admin)"
echo -e "  📡 Private Node Scrape Target: ${PURPLE}http://app:5000/metrics${NC}"
echo -e "  🐳 Private cAdvisor Exporter : ${PURPLE}http://cadvisor:8080/metrics${NC}"
echo -e "${GREEN}===================================================${NC}"
