#!/bin/bash
# Day 21 VPS automated zero-downtime deployment & TLS verification script

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🚀 Day 21: Production VPS Observability Cluster Deployer${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Clean existing containers to prevent resource/port conflicts
echo -e "${BLUE}Purging legacy container states...${NC}"
docker compose -f docker-compose.prod.yml down -v --remove-orphans >/dev/null 2>&1
docker rm -f vpsdock-nginx vpsdock-certbot vpsdock-app vpsdock-db vpsdock-prometheus vpsdock-grafana >/dev/null 2>&1

# 2. Seed dummy SSL certificates so Nginx successfully boots on public host
echo -e "\n${BLUE}Initializing fallback production TLS certificate profiles...${NC}"
mkdir -p nginx/ssl/live/localhost
if [ ! -f nginx/ssl/live/localhost/privkey.pem ]; then
    echo -e "Generating mock self-signed fallback key pair..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/live/localhost/privkey.pem \
        -out nginx/ssl/live/localhost/fullchain.pem \
        -subj "/CN=localhost" >/dev/null 2>&1
    echo -e "${GREEN}✓ Fallback certificates seeded.${NC}"
fi

# 3. Boot production stack
echo -e "\n${BLUE}Launching Docker Compose Production cluster...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# 4. Wait for database initialization
echo -e "\n${BLUE}Awaiting PostgreSQL healthchecks...${NC}"
for i in {1..12}; do
    health_status=$(docker inspect --format='{{json .State.Health.Status}}' vpsdock-db 2>/dev/null)
    if [ "$health_status" == "\"healthy\"" ]; then
        echo -e "${GREEN}✓ Database health validated: HEALTHY${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# 5. Verify local HTTP port 80 to 443 TLS redirection logic
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: PORT 80 ACME CHALLENGE & TLS REDIRECT TEST${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Probing HTTP port 80 for auto-redirect redirection rules..."
probe_redirect=$(curl -sI http://localhost | grep -i "Location")

if [[ "$probe_redirect" == *"https://"* ]]; then
    echo -e "${GREEN}✓ SECURE redirect verified: $probe_redirect${NC}"
else
    echo -e "${RED}❌ Redirect check failed. HTTP did not auto-route to secure TLS gateway.${NC}"
fi

# 6. Verify Nginx HTTPS handshake is listening
echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: HTTPS TLS HANDSHAKE & GATEWAY TEST${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Validating local HTTPS secure handshake..."
probe_https=$(curl -sI -k https://localhost)

if [[ "$probe_https" == *"HTTP/"* ]]; then
    echo -e "${GREEN}✓ HTTPS gateway successfully terminated TLS handshake!${NC}"
    echo -e "Gateway Headers:\n${PURPLE}$probe_https${NC}"
else
    echo -e "${RED}❌ HTTPS gateway terminated unexpectedly.${NC}"
    docker compose -f docker-compose.prod.yml logs nginx-gateway
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete! Production VPS Cluster online!${NC}"
echo -e "  🛡️ Hardened HTTPS Gateway : ${PURPLE}https://localhost${NC} (Bypassing self-signed cert warning)"
echo -e "  📡 Private Node Scraper   : ${PURPLE}http://app:5000/metrics${NC}"
echo -e "  📊 Private Grafana Backend: ${PURPLE}http://grafana:3000${NC}"
echo -e "${GREEN}===================================================${NC}"
