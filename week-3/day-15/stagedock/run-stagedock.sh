#!/bin/bash
# Day 15 Advanced Multi-Stage Build size analysis and test runner

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}📦 Day 15: Multi-Stage Build Performance Showcase${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing test containers and legacy test images
echo -e "${BLUE}Purging stale test artifacts...${NC}"
docker rm -f stagedock-heavy-container stagedock-slim-container >/dev/null 2>&1
docker rmi -f stagedock:heavy stagedock:slim >/dev/null 2>&1

# 1. Compile Heavy Image
echo -e "\n${BLUE}[1/2] Compiling single-stage heavy image (node:20 base + devDeps)...${NC}"
docker build -f Dockerfile.heavy -t stagedock:heavy .

# 2. Compile Slim Image
echo -e "\n${BLUE}[2/2] Compiling multi-stage slim image (node:20-alpine base, no devDeps)...${NC}"
docker build -f Dockerfile.slim -t stagedock:slim .

# 3. Retrieve size statistics
size_heavy_raw=$(docker images stagedock:heavy --format "{{.Size}}")
size_slim_raw=$(docker images stagedock:slim --format "{{.Size}}")

# Convert sizes to numerical values (approximate in MB)
parse_to_mb() {
    local val=$1
    if [[ "$val" == *GB ]]; then
        # Extract number and multiply
        local num=$(echo "$val" | sed 's/GB//g')
        echo "scale=2; $num * 1000" | bc | cut -d'.' -f1
    elif [[ "$val" == *MB ]]; then
        echo "$val" | sed 's/MB//g' | cut -d'.' -f1
    else
        echo "0"
    fi
}

mb_heavy=$(parse_to_mb "$size_heavy_raw")
mb_slim=$(parse_to_mb "$size_slim_raw")

# Calculate saving percentages
savings_mb=$((mb_heavy - mb_slim))
savings_pct=$(echo "scale=2; ($savings_mb / $mb_heavy) * 100" | bc | cut -d'.' -f1)

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}📊 COMPILATION IMAGE SIZE METRICS REPORT:${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "  - 🏋️ Single-Stage heavy: ${RED}${size_heavy_raw} (${mb_heavy} MB)${NC}"
echo -e "  - ⚡ Multi-Stage slim  : ${GREEN}${size_slim_raw} (${mb_slim} MB)${NC}"
echo -e "  - 🧹 Storage Saved     : ${PURPLE}${savings_mb} MB (${savings_pct}% Smaller!)${NC}"
echo -e "${GREEN}===================================================${NC}"

# ASCII comparison visualizer
echo -e "\n${BLUE}Visual footprint comparisons:${NC}"
echo -e "Heavy: [########################################] ${mb_heavy} MB"
# Calculate slim bar segments
slim_segments=$(( (mb_slim * 40) / mb_heavy ))
if [ $slim_segments -lt 1 ]; then slim_segments=1; fi
slim_bar=""
for ((i=0; i<slim_segments; i++)); do slim_bar="${slim_bar}#"; done
for ((i=slim_segments; i<40; i++)); do slim_bar="${slim_bar}."; done
echo -e "Slim : [${GREEN}${slim_bar}${NC}] ${mb_slim} MB"

echo -e "\n${GREEN}✓ Deploying optimized stagedock:slim container...${NC}"
docker run -d --name stagedock-slim-container -p 3000:3000 stagedock:slim

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Production telemetry container is active on http://localhost:3000!${NC}"
    echo -e "To inspect process logs: ${PURPLE}docker logs stagedock-slim-container${NC}"
    echo -e "To inspect security UID:  ${PURPLE}docker exec stagedock-slim-container id${NC}"
    echo -e "${GREEN}===================================================${NC}"
else
    echo -e "${RED}❌ Failed to start optimized stagedock:slim container.${NC}"
fi
