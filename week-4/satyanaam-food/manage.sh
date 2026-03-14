#!/bin/bash

# ==============================================================================
# SATYANAAM FOOD - DOCKER INFRASTRUCTURE ORCHESTRATOR
# ==============================================================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function show_help() {
    echo -e "${CYAN}Satyanaam Food Platform Manager Utility${NC}"
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  up         - Builds and starts all containers in detached mode"
    echo "  down       - Stops all active containers"
    echo "  restart    - Rebuilds and restarts all services"
    echo "  logs       - Follow real-time log aggregates"
    echo "  seed       - Force run database menu seeder"
    echo "  health     - Check health status of API gateway and cache"
    echo "  clean      - Stops containers and purges persistent database volumes"
}

function check_docker() {
    if ! [ -x "$(command -v docker)" ]; then
        echo -e "${RED}Error: Docker is not installed on this system.${NC}" >&2
        exit 1
    fi
}

case "$1" in
    up)
        check_docker
        echo -e "${GREEN}🚀 Booting Satyanaam Food multi-container infrastructure...${NC}"
        docker compose up --build -d
        echo -e "${GREEN}✓ All services successfully initialized!${NC}"
        echo "   - Frontend Web Gateway: http://localhost:8080"
        echo "   - Backend Core API:     http://localhost:4500"
        echo "   - Prometheus Telemetry: http://localhost:9090"
        echo "   - Grafana Dashboards:   http://localhost:3000"
        ;;
    down)
        check_docker
        echo -e "${YELLOW}🔌 Shutting down container infrastructure...${NC}"
        docker compose down
        echo -e "${GREEN}✓ Shutdown complete.${NC}"
        ;;
    restart)
        check_docker
        $0 down
        $0 up
        ;;
    logs)
        check_docker
        docker compose logs -f
        ;;
    seed)
        check_docker
        echo -e "${YELLOW}🌱 Triggering automated menu database seeder...${NC}"
        docker compose exec satyanaam-backend node seed-menu.js
        ;;
    health)
        echo -e "${CYAN}🔍 Querying backend endpoint health indicators...${NC}"
        curl -s http://localhost:4500/health | json_pp 2>/dev/null || curl -s http://localhost:4500/health
        echo ""
        ;;
    clean)
        check_docker
        echo -e "${RED}⚠️ Purging all containers and persistent MongoDB/Redis volumes...${NC}"
        docker compose down -v
        echo -e "${GREEN}✓ Clean up complete.${NC}"
        ;;
    *)
        show_help
        ;;
esac
