# Week 1 - Day 3: Docker Images & Layering Blueprint 🐳

Welcome to Day 3 of your Docker learning journey! Today, we are mastering **Docker Images**, learning how Docker builds filesystems layer-by-layer, and understanding the core instructions under the hood.

---

## 📌 Concepts: What is a Docker Image?

A Docker Image is an **immutable (read-only) blueprint** containing the exact filesystem, code, libraries, and metadata required to start a container.

```mermaid
graph TD
    subgraph Container Layer (Read-Write)
        RW[Writeable Container Layer]
    end
    subgraph Docker Image Layers (Read-Only)
        L4[CMD Layer: Metadata Startup]
        L3[COPY Layer: App Files / Script]
        L2[RUN Layer: Package Installations]
        L1[FROM Layer: Base OS Filesystem]
    end
    RW --> L4
    L4 --> L3
    L3 --> L2
    L2 --> L1
```

### The Layering Mechanism & Cache
*   **Layer stacking:** Each instruction in a `Dockerfile` (e.g. `FROM`, `RUN`, `COPY`) creates a **new read-only layer** stacked on top of the previous one.
*   **Layer Caching:** When you rebuild an image, Docker inspects the instructions. If a step hasn't changed, Docker reuses the cached layer (`---> Using cache`), saving time and bandwidth!

---

## 🛠️ The 4 Core Dockerfile Instructions

| Instruction | Action | Best Practice |
| :--- | :--- | :--- |
| **`FROM`** | Defines the starting baseline image template (Operating System). | Always specify a trusted, official, or minimal base image. |
| **`RUN`** | Executes command scripts inside the image layer at build time (e.g. installs tools). | Combine consecutive command lines (using `&&` and `\`) to reduce total layer count! |
| **`COPY`** | Injects files from your local host machine workspace directory directly into the image filesystem. | Copy only the specific files necessary for compilation to leverage layering cache. |
| **`CMD`** | Defines the default runtime command/process of the container. Only the *last* CMD executes! | Use the executable array format: `["./script.sh"]` rather than string format. |

---

## 🎯 Day 3 Mini Project: Build a Custom Developer Ubuntu Image

In this hands-on lesson, you will compile a custom **Ubuntu 24.04** environment equipped with standard development tools (`git`, `htop`, `curl`, `neofetch`) and analyze its internal layer structure.

### Step 1: Compile the Image (Docker Build)
Run the build instruction from the project root folder. It reads your `Dockerfile` and builds each layer:
```bash
docker build -t custom-ubuntu ./week-1/day-3
```

### Step 2: Launch the Container (Interactive Mode)
Start your newly compiled developer template. Since our container is an interactive CLI workspace, we boot it using `-it` (Interactive + TTY) flags so we can enter it directly:
```bash
docker run -it --name ubuntu-dev custom-ubuntu
```
*(You will immediately see your custom ASCII banner showing that git, htop, curl, and neofetch are fully installed and configured!)*

### Step 3: Inspect Filesystem Layer History
Open a new terminal window on your host computer and run:
```bash
docker history custom-ubuntu
```
This prints the layer-by-layer details of your image, listing the size contribution of each step! Notice how `FROM` (base size) and `RUN` (installed packages size) consume storage space, while `CMD` consumes `0 bytes` (since it is metadata!).

---

## 🎨 Visualizing Layers
Open the companion visual layering simulator **`index.html`** in your browser. It includes a complete **layer stack simulator** where you can trigger clean builds, test step-by-step layer cache hits, and highlight what each instruction does inside the stack!
