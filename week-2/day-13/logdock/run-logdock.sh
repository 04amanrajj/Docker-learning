#!/bin/bash
# Day 13 LogDock Diagnostics & Execution Orchestration Pipeline

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}📜 Day 13: LogDock Logging & Shell Execution Pipeline${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing container
echo -e "${BLUE}Cleaning older logdock processes...${NC}"
docker compose down >/dev/null 2>&1

# Build and start services
echo -e "\n${BLUE}Compiling and booting LogDock Logging engine...${NC}"
docker compose up -d --build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Success! Container 'logdock-app' is running in the background.${NC}"
    
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${PURPLE}🧪 TEST 1: Inspecting Container Logs (docker logs)${NC}"
    echo -e "${BLUE}===================================================${NC}"
    echo -e "Waiting 4 seconds for logs to accumulate..."
    sleep 4
    
    echo -e "\nRunning: ${GREEN}docker logs logdock-app --tail 10${NC}"
    docker logs logdock-app --tail 10
    
    echo -e "\n${BLUE}===================================================${NC}"
    echo -e "${PURPLE}🧪 TEST 2: Running Interactive Commands (docker exec)${NC}"
    echo -e "${BLUE}===================================================${NC}"
    
    echo -e "\nRunning: ${GREEN}docker exec logdock-app ls -lh logs/${NC}"
    docker exec logdock-app ls -lh logs/
    
    echo -e "\nRunning: ${GREEN}docker exec logdock-app tail -n 5 logs/internal-audit.log${NC}"
    docker exec logdock-app tail -n 5 logs/internal-audit.log

    echo -e "\nRunning: ${GREEN}docker exec logdock-app uname -a${NC}"
    docker exec logdock-app uname -a

    echo -e "\n${GREEN}===================================================${NC}"
    echo -e "${GREEN}🎉 Day 13 logging and shell execution sandbox verified successfully!${NC}"
    echo -e "  To stream logs in real-time, run:   ${PURPLE}docker logs -f logdock-app${NC}"
    echo -e "  To enter the container shell, run:  ${PURPLE}docker exec -it logdock-app sh${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Failed to start LogDock instance.${NC}"
fi
