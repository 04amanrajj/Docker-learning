#!/bin/bash
# Day 19 SecretDock production-grade Secrets validation pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🔑 Day 19: Production Docker Secrets Auditing Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Clean existing containers
echo -e "${BLUE}Purging legacy container states...${NC}"
docker compose down -v --remove-orphans >/dev/null 2>&1
docker rm -f secretdock-app secretdock-db secretdock-frontend proddock-app proddock-db proddock-cache proddock-frontend >/dev/null 2>&1

# 2. Seed secure secrets directory & files dynamically
echo -e "${BLUE}Creating secure local secrets templates...${NC}"
mkdir -p secrets
echo "pg_secret_pass_$(date +%s)" > secrets/db_password.txt
echo "sk_cloud_live_$(date +%s | sha256sum | head -c 32)" > secrets/api_key.txt
chmod 600 secrets/*.txt

# 3. Boot Compose cluster
echo -e "\n${BLUE}Booting SecretDock service stack (App, Postgres, Nginx)...${NC}"
docker compose up -d --build

# 4. Wait for database initialization
echo -e "\n${BLUE}Awaiting PostgreSQL secure healthcheck authorization...${NC}"
for i in {1..12}; do
    health_status=$(docker inspect --format='{{json .State.Health.Status}}' secretdock-db 2>/dev/null)
    if [ "$health_status" == "\"healthy\"" ]; then
        echo -e "${GREEN}✓ Database health validated: HEALTHY${NC}"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 1: METADATA ENVIRONMENT LEAKS AUDIT (docker inspect)${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Inspecting env logs inside running app container for credentials..."
inspect_env=$(docker inspect --format='{{json .Config.Env}}' secretdock-app)

echo -e "Exposed environment values detected:\n${PURPLE}$inspect_env${NC}\n"

if [[ "$inspect_env" == *"pg_secret"* ]] || [[ "$inspect_env" == *"sk_cloud"* ]]; then
    echo -e "${RED}❌ LEAK ALERT! Plaintext secrets were detected in the container metadata!${NC}"
else
    echo -e "${GREEN}✓ SECURE: Absolutely no sensitive secrets detected inside environment metadata!${NC}"
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STAGE 2: IN-MEMORY SECRETS RESOLUTION AUDIT (curl)${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "Waiting for Node API service initialization..."
sleep 3

response=$(curl -s http://localhost:8080/api/secrets)

if [[ "$response" == *'"success":true'* ]]; then
    echo -e "${GREEN}✓ Telemetry secrets loaded successfully through Nginx!${NC}"
    echo -e "Secrets Auditor Summary:\n"
    echo "$response" | grep -E '"dbPasswordSecret"|"apiTokenSecret"|"leakWarning"|"databaseState"'
else
    echo -e "${RED}❌ Failed to query secrets auditor backend.${NC}"
    docker compose logs app
fi

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Deployment Complete! Secrets cluster online!${NC}"
echo -e "  🛡️ Open Secrets UI : ${PURPLE}http://localhost:8080${NC}"
echo -e "  📡 Live API Endpoint: ${PURPLE}http://localhost:8080/api/secrets${NC}"
echo -e "${GREEN}===================================================${NC}"
