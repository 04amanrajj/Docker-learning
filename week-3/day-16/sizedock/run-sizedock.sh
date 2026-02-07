#!/bin/bash
# Day 16 Docker Image Layer Size footprint audit and optimization dashboard launcher

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🔍 Day 16: Interrogating & Optimizing Container Layers${NC}"
echo -e "${BLUE}===================================================${NC}"

# Clean existing build images and compose stacks
echo -e "${BLUE}Cleaning legacy test images and compose stacks...${NC}"
docker compose down >/dev/null 2>&1
docker rmi -f sizedock:unoptimized sizedock:optimized >/dev/null 2>&1

# 1. Build Unoptimized Image
echo -e "\n${BLUE}[1/2] Compiling multi-layer unoptimized image (dd file + separate rm)...${NC}"
docker build -f Dockerfile.unoptimized -t sizedock:unoptimized .

# 2. Build Optimized Image
echo -e "\n${BLUE}[2/2] Compiling chain-optimized single-layer image (chained dd && rm)...${NC}"
docker build -f Dockerfile.optimized -t sizedock:optimized .

# 3. Boot Dashboard Orchestrator
echo -e "\n${BLUE}Booting SizeDock Layer Auditor visualizer dashboard...${NC}"
docker compose up -d --build

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STEP 1: INTERROGATING SYSTEM FOOTPRINTS (docker image ls)${NC}"
echo -e "${GREEN}===================================================${NC}"
docker image ls | grep sizedock

# Parse sizes
size_unopt_raw=$(docker images sizedock:unoptimized --format "{{.Size}}")
size_opt_raw=$(docker images sizedock:optimized --format "{{.Size}}")

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}🔍 STEP 2: AUDITING LAYER HISTORIES (docker history)${NC}"
echo -e "${GREEN}===================================================${NC}"

echo -e "\n${RED}Unoptimized Image History:${NC}"
docker history sizedock:unoptimized --format "table {{.CreatedBy}}\t{{.Size}}" | head -n 6

echo -e "\n${GREEN}Optimized Image History:${NC}"
docker history sizedock:optimized --format "table {{.CreatedBy}}\t{{.Size}}" | head -n 6

echo -e "\n${GREEN}===================================================${NC}"
echo -e "${GREEN}📊 COMPILATION LAYER AUDIT SUMMARY & VISUALIZER:${NC}"
echo -e "${GREEN}===================================================${NC}"
echo -e "  - 🏋️ Unoptimized Image Size: ${RED}${size_unopt_raw}${NC} (Contains hidden 25MB layer!)"
echo -e "  - ⚡ Optimized Image Size  : ${GREEN}${size_opt_raw}${NC} (Chain-cleaned, 25MB fully purged!)"
echo -e "\n  🚀 Dashboard Visualizer Live at : ${PURPLE}http://localhost:8080${NC}"
echo -e "${GREEN}===================================================${NC}"
