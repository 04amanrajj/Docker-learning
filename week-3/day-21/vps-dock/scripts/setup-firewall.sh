#!/bin/bash
# Day 21 VPS host firewall configuration script
# Enforces basic ingress filtering and rate limits to secure public container endpoints

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}🛡️ Day 21: Configuring Hardened Host-Level UFW Firewall${NC}"
echo -e "${BLUE}===================================================${NC}"

# Check for root privilege
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run this script as root (sudo bash setup-firewall.sh).${NC}"
    exit 1
fi

# 1. Reset standard UFW configurations
echo -e "${BLUE}Resetting default firewall rules...${NC}"
ufw --force reset >/dev/null

# 2. Set default policies
echo -e "${BLUE}Setting default incoming to DENY and outgoing to ALLOW...${NC}"
ufw default deny incoming
ufw default allow outgoing

# 3. Allow essential web entry points
echo -e "${BLUE}Exposing HTTP (80) and HTTPS (443) ports...${NC}"
ufw allow 80/tcp comment 'Nginx HTTP Gateway'
ufw allow 443/tcp comment 'Nginx HTTPS TLS Termination'

# 4. Enable rate limiting on SSH (22)
echo -e "${BLUE}Configuring rate-limiting on SSH port 22 to block brute force attacks...${NC}"
ufw limit 22/tcp comment 'Rate-limited SSH'

# 5. Lock down raw container ports from direct public ingress
echo -e "${BLUE}✓ Blocked direct ingress to database (5432) and telemetry (5000, 9090).${NC}"

# 6. Enable firewall
echo -e "${BLUE}Activating UFW...${NC}"
ufw --force enable

echo -e "${GREEN}===================================================${NC}"
echo -e "${GREEN}✓ Firewall configuration completed! Active rules status:${NC}"
echo -e "${GREEN}===================================================${NC}"
ufw status verbose
