# Week 1 - Day 5: Docker Volumes & Persistent Storage 💾

Today, I shifted my focus to **Persistent Storage & Volumes**. By default, containers are completely ephemeral—meaning if a container crashes or is deleted, all the records and changes generated inside its writable layer are permanently lost. To solve this, I learned how to decouple storage from the container lifecycle using **Named Volumes** and **Bind Mounts**.

---

## 📌 Concepts: Ephemeral vs Persistent Storage

When a container runs, it writes files to a temporary read-write filesystem layer. If the container is destroyed, that layer is discarded. Docker provides two primary mechanisms to mount host directories into containers for true data persistence.

```mermaid
graph TD
    Host["Host Machine Filesystem"]
    
    subgraph Docker Managed Space [/var/lib/docker/volumes/]
        NV["Named Volume: 'pg-data'"]
    end
    
    subgraph Local User Project [/home/user/project/]
        BM["Bind Mount: './config'"]
    end

    Container1["Postgres Container"] -->|"Mounts to /var/lib/postgresql/data"| NV
    Container2["Nginx Container"] -->|"Mounts to /usr/share/nginx/html"| BM
    
    Host -.-> NV
    Host -.-> BM
```

### 1. Named Volumes (Docker Managed)
* **Purpose:** Docker manages a designated area of the host filesystem (usually `/var/lib/docker/volumes/` on Linux) where data is stored.
* **Why it matters:** Perfect for database state (like PostgreSQL, MySQL) where the host's directory structure doesn't matter to me. It's safe, fast, and fully isolated from standard host user interference.

### 2. Bind Mounts (User Managed)
* **Purpose:** Maps an exact directory from my host computer (e.g. `/home/amanrajj/projects/config`) directly into a container path.
* **Why it matters:** Perfect for active development (such as mounting source code so that modifications on my computer instantly reflect inside the container without a rebuild).

---

## 🛠️ Docker Volume Commands Reference

Here are the primary volume utilities I mastered:

| Command | Action | Purpose |
| :--- | :--- | :--- |
| `docker volume create <name>` | Create Volume | Explicitly instantiates a persistent named volume block. |
| `docker volume ls` | List Volumes | Shows all Docker-managed volumes active on the system. |
| `docker volume inspect <name>` | Telemetry | Prints the physical mount point directory path on the host computer. |
| `docker volume rm <name>` | Delete Volume | Destroys a volume (only works if no containers are attached!). |
| `docker volume prune` | Garbage Collect | Permanently deletes all unused volumes to reclaim host space. |

---

## 🎯 Day 5 Mini Project: Persist Postgres Data

For my hands-on project, I implemented data persistence for a **PostgreSQL 16** database container. I wrote a seed SQL file and automated the lifecycle test via a bash shell script (`test-persistence.sh`).

### Step 1: Instantiate the Named Volume
I created the volume to hold my PostgreSQL binary clusters:
```bash
docker volume create pg-data
```

### Step 2: Spin up 'pg-server-1' and Seed Data
I launched a detached PostgreSQL instance, linking the private database cluster storage path `/var/lib/postgresql/data` directly to my persistent volume:
```bash
docker run --name pg-server-1 \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=dockersandbox \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:16-alpine
```

I seeded the database by feeding my `init.sql` script into the server:
```bash
docker exec -i pg-server-1 psql -U postgres -d dockersandbox < ./week-1/day-5/postgres-test/init.sql
```

I checked the developer records inside the container:
```bash
docker exec -it pg-server-1 psql -U postgres -d dockersandbox -c "SELECT * FROM developers;"
```

### Step 3: Trigger Container Destruction (The Test)
I stopped and completely deleted `pg-server-1` to simulate a complete container failure:
```bash
docker stop pg-server-1 && docker rm pg-server-1
```
*(At this point, any standard ephemeral database would be completely lost!)*

### Step 4: Boot 'pg-server-2' (Data Resurrection)
I started a brand-new container instance under a different name, mounting the exact same volume:
```bash
docker run --name pg-server-2 \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=dockersandbox \
  -v pg-data:/var/lib/postgresql/data \
  -d postgres:16-alpine
```

I queried the new instance to verify if my records survived:
```bash
docker exec -it pg-server-2 psql -U postgres -d dockersandbox -c "SELECT * FROM developers;"
```
*(Boom! The records returned immediately! The persistent volumes seamlessly restored my active database state!)*

---

## 🎨 Interactive Volumes Simulator
Open **`index.html`** inside your browser to view the **Docker Volume Storage Engine** visualizer! You can inspect database tables, execute SQL inserts, delete/restart containers, toggle between Bind Mounts and Named Volumes, and watch data sync in real time!
