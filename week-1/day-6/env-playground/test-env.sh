#!/bin/bash
# Day 6 environment playground test harness automation

# Set terminal coloring
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}⚙️ Day 6: Environment Variables Test Automation Harness${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Compile the playground container image
echo -e "\n${BLUE}[1/5] Compiling env-playground container image...${NC}"
docker build -t env-playground .

# 2. Boot container with built-in image defaults
echo -e "\n${BLUE}[2/5] Booting container with built-in Dockerfile defaults...${NC}"
docker run -d --name env-default-app -p 8080:3000 env-playground
sleep 2 # wait for node process to initialize

# 3. Query default container metadata
echo -e "${GREEN}[3/5] Querying default container API...${NC}"
curl -s http://localhost:8080 | grep -o '"message":[^,]*' || echo -e "${RED}Failed to curl default app!${NC}"

# Clean up default instance
docker stop env-default-app >/dev/null
docker rm env-default-app >/dev/null
echo -e "${GREEN}✓ Ephemeral default container destroyed.${NC}"

# 4. Create local private .env file override
echo -e "\n${BLUE}[4/5] Preparing custom local environmental overrides...${NC}"
cat <<EOT > .env
PORT=3000
APP_ENV=staging
WELCOME_MESSAGE=Dynamically overridden via local env file! 🚀
THEME_COLOR=#a855f7
DB_HOST=aws-rds-cluster-database
API_KEY=productionsecretkey999
EOT
echo -e "${GREEN}✓ Local .env profile populated successfully.${NC}"

# 5. Boot container with bulk env-file overrides
echo -e "\n${BLUE}[5/5] Booting container with bulk --env-file overrides...${NC}"
docker run -d --name env-overridden-app --env-file .env -p 8080:3000 env-playground
sleep 2

echo -e "${GREEN}Querying overridden container API:${NC}"
response=$(curl -s http://localhost:8080)
echo -e "${PURPLE}$response${NC}"

# Confirm DB_HOST was updated dynamically
if [[ $response == *"aws-rds-cluster-database"* ]]; then
    echo -e "\n${GREEN}🎉 SUCCESS! Environment variables successfully injected at runtime without rebuilding!${NC}"
else
    echo -e "\n${RED}⚠️ FAILURE: Overrides did not take effect.${NC}"
fi

# Clean up overridden instance and tmp env file
docker stop env-overridden-app >/dev/null
docker rm env-overridden-app >/dev/null
rm .env
echo -e "${GREEN}✓ Environmental sandbox cleaned up successfully.${NC}"
echo -e "${BLUE}===================================================${NC}"
