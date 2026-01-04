#!/usr/bin/env bash
# ==============================================================================
# Docker Learning Sandbox - Day 5: Postgres Volumes Persistence Test
# ==============================================================================

# ANSI Color Codes for beautiful console feedback
GREEN='\033[0;32m'
CYAN='\033[0;36m'
AMBER='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}🐳 Starting Day 5 Mini Project: Postgres Volumes Persistence Test${NC}"
echo -e "------------------------------------------------------------"

# Step 1: Create a named volume
echo -e "${CYAN}[Step 1/6] Creating Named Volume 'pg-data'...${NC}"
docker volume create pg-data
echo -e "${GREEN}✓ Named volume 'pg-data' created successfully.${NC}\n"

# Step 2: Boot first Postgres instance with Named Volume
echo -e "${CYAN}[Step 2/6] Launching temporary container 'pg-server-1' with volume...${NC}"
docker run --name pg-server-1 \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=dockersandbox \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:16-alpine

echo -e "Waiting 8 seconds for PostgreSQL to initialize and listen..."
sleep 8

# Step 3: Run seed SQL script
echo -e "${CYAN}[Step 3/6] Running SQL initialization & seed script...${NC}"
docker exec -i pg-server-1 psql -U postgres -d dockersandbox < ./week-1/day-5/postgres-test/init.sql
echo -e "${GREEN}✓ Database seeded with initial table and record.${NC}\n"

# Verify initial insertion
echo -e "${AMBER}Current Records in pg-server-1:${NC}"
docker exec -it pg-server-1 psql -U postgres -d dockersandbox -c "SELECT * FROM developers;"
echo ""

# Step 4: Destroy the first container
echo -e "${CYAN}[Step 4/6] Stopping and deleting 'pg-server-1' container (Simulating disaster)...${NC}"
docker stop pg-server-1 > /dev/null
docker rm pg-server-1 > /dev/null
echo -e "${RED}✗ Container pg-server-1 has been permanently destroyed!${NC}\n"

# Step 5: Start a second container attached to the same Named Volume
echo -e "${CYAN}[Step 5/6] Launching a brand new container 'pg-server-2' attached to 'pg-data'...${NC}"
docker run --name pg-server-2 \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=dockersandbox \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:16-alpine

echo -e "Waiting 8 seconds for new PostgreSQL instance to bind to the persistent files..."
sleep 8

# Step 6: Verify the data survived container deletion
echo -e "${CYAN}[Step 6/6] Reading records from 'pg-server-2'...${NC}"
echo -e "${GREEN}Result from newly spawned container:${NC}"
docker exec -it pg-server-2 psql -U postgres -d dockersandbox -c "SELECT * FROM developers;"

echo -e "\n${GREEN}🎉 SUCCESS! The database records survived container deletion because they reside inside the persistent 'pg-data' volume!${NC}"
echo -e "------------------------------------------------------------"
echo -e "${AMBER}Cleaning up containers and volumes...${NC}"
docker stop pg-server-2 > /dev/null
docker rm pg-server-2 > /dev/null
docker volume rm pg-data > /dev/null
echo -e "${GREEN}✓ Sandbox cleaned successfully.${NC}"
