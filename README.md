# 🐳 My 4-Week Docker & DevOps Learning Journey

Welcome to my personal Docker and DevOps portfolio! This repository documents my step-by-step progression over a 4-week timeline, moving from basic containerization theory to engineering production-grade, observable microservice networks.

---

## 📅 Week-by-Week Learning Roadmap & Achievements

This workspace documents my progression and milestones through each week of learning:

### 🚀 Week 1: Docker Basics & Container Fundamentals
Focuses on building the absolute fundamentals of container technology, understanding the Docker engine, and moving away from VM-centric mindsets.
*   **Docker CLI Mastery**: Learned how to construct, start, inspect, stop, and clean containers and images (`docker run`, `exec`, `ps`, `logs`, `rmi`, `system prune`).
*   **Creating Dockerfiles**: Learned how base images work, caching layers with `COPY`/`RUN`, setting working directories (`WORKDIR`), and exposing application ports (`EXPOSE`).
*   **Single-Service Containerization**: Containerized simple static web pages and single Node.js REST API servers.

### 📦 Week 2: Build Optimizations & Environment Configurations
Focuses on making container builds secure, lightweight, and dynamically configurable.
*   **Multi-Stage Dockerfiles**: Mastered building separate builder stages to download build tools and compile dependencies, copying only the lightweight production assets to the final minimal stage (reducing image size by up to 80%).
*   **Environment Mappings**: Configured application code to read configuration keys dynamically using `.env` variables injected directly at container runtime.
*   **Dynamic Configurations**: Handled reverse-proxy path overrides and custom port bindings depending on host execution environments.

### 🌐 Week 3: Multi-Container Orchestration & Bridge Networks
Focuses on linking multiple systems together to form unified, cohesive platforms.
*   **Docker Compose**: Designed master orchestration files (`docker-compose.yml`) to build and start multiple services with a single command (`docker compose up`).
*   **Isolated Bridge Networks**: Established private, user-defined subnet bridges so databases (MongoDB, PostgreSQL) and caches (Redis) remain hidden from the outside host network.
*   **Container DNS Discovery**: Leveraged Docker's internal DNS so microservices communicate dynamically using container hostnames (e.g. connecting to `mongodb:27017` or `redis:6379` instead of hardcoded IPs).
*   **Named Storage Volumes**: Designed persistent Docker Volumes to map safe database directories on the physical host machine, keeping database records completely secure across container updates and restarts.

### 🏆 Week 4: Production Culminations & Active Observability
The peak of my learning journey, putting it all together in full-scale corporate templates (like **PortDock** and **Satyanaam Food**).
*   **Self-Healing & Reconnection**: Implemented recursive DB connection-retry algorithms so servers wait gracefully for databases to boot up instead of crashing.
*   **Proxy-Aware Security**: Made backend rate-limiters proxy-aware (using `X-Forwarded-For` mapping) to individually throttle users behind Nginx proxies.
*   **Active Cache Invalidation**: Integrated Redis invalidation hooks in Express controllers to purge cached categories (`menuitems:*`) the moment write operations occur.
*   **Advanced Telemetry**: Built built-in metrics endpoints (`/metrics`) to export CPU, Node.js memory footprint, and Redis statistics to Prometheus.
*   **Visual Dashboards**: Integrated Prometheus metric scraping and provisioned Grafana analytical dashboards to trace system performance in real-time.
*   **Developer Tooling**: Wrote cohesive orchestration utilities (`manage.sh`) and E2E connectivity test verification scripts (`verify-stack.js`).

---

## 🎓 Core Pillars of What I Learned

1.  **Container Portability**: Build once, run anywhere. Docker removes "it worked on my machine" bugs.
2.  **Ephemerality vs. Persistence**: Knowing when to keep container storage temporary and when to attach named volumes for databases.
3.  **Strict Security Postures**: Running applications using unprivileged system users (non-root `node` users) and keeping databases locked behind internal bridge networks.
4.  **Observability-Driven DevOps**: Redefining system visibility using live console tracers, Prometheus scrapers, and Grafana analytics.
5.  **IPv4 Loopback Resolving (`127.0.0.1` vs `localhost`)**: Understanding Alpine's dual IPv4/IPv6 resolver and explicitly targeting `127.0.0.1` to prevent connection-refused healthcheck errors.
