// 📅 Week-by-Week Data
const timelineData = {
    1: {
        title: "🚀 Week 1: Docker Basics & Container Fundamentals",
        subtitle: "Building the absolute foundations of container image architecture",
        description: "My DevOps journey started by mastering single-service containerization, understanding the layers inside a Dockerfile, and learning the Docker engine CLI commands.",
        bullets: [
            { icon: "🐳", title: "Docker CLI Mastery", text: "Mastered building, running, mapping ports, inspecting, and purging container images." },
            { icon: "📄", title: "Dockerfile Blueprinting", text: "Learned core keywords: FROM, WORKDIR, COPY, RUN, EXPOSE, CMD, and ENTRYPOINT." },
            { icon: "🌐", title: "Single-Service Hosting", text: "Containerized basic standalone static HTML pages and basic Node.js servers." },
            { icon: "⚡", title: "Layer Caching Efficiency", text: "Structured Dockerfiles to separate dependencies from code changes for ultra-fast builds." }
        ]
    },
    2: {
        title: "📦 Week 2: Build Optimizations & Configurations",
        subtitle: "Crafting lightweight, secure, and production-ready images",
        description: "Optimized container sizes, mapped dynamic environment variables, and configured reverse proxies for multi-environment scaling.",
        bullets: [
            { icon: "✂️", title: "Multi-Stage Dockerfiles", text: "Split compiles into a separate 'builder' container to keep final images minimal." },
            { icon: "🔒", title: "Non-Root Privilege Settings", text: "Enhanced container security by executing application processes under unprivileged 'node' users." },
            { icon: "⚙️", title: "Dynamic Environments", text: "Injected variables dynamically at container runtime using .env mapping templates." },
            { icon: "🛡️", title: "Layer Optimization", text: "Reduced final static web server footprints to under 40MB by utilizing Alpine bases." }
        ]
    },
    3: {
        title: "🌐 Week 3: Orchestrations & Secure Subnets",
        subtitle: "Linking services and establishing hard-disk persistences",
        description: "Orchestrated cohesive multi-container systems, built secure virtual subnets, and established hard-drive persistent mappings.",
        bullets: [
            { icon: "🛠️", title: "Docker Compose Engines", text: "Orchestrated Nginx, Node.js API, MongoDB, and Redis with single command boot-ups." },
            { icon: "💾", title: "Named Storage Volumes", text: "Mapped persistent local host storage directories to databases so data survives restarts." },
            { icon: "🛡️", title: "Isolated Bridge Networks", text: "Shielded databases and caches inside private subnets, keeping ports completely hidden." },
            { icon: "📡", title: "Dynamic DNS Resolution", text: "Integrated service hostname lookups so servers talk using container hostnames." }
        ]
    },
    4: {
        title: "🏆 Week 4: Culminations & Active Observability",
        subtitle: "Achieving fully observable, resilient, corporate architectures",
        description: "Engineered self-healing architectures, proxy-aware securities, Redis cache-invalidations, and Prometheus/Grafana monitors.",
        bullets: [
            { icon: "🔌", title: "Self-Healing DB Connections", text: "Implemented connect-retry loops so backend waits for MongoDB database boots." },
            { icon: "⚡", title: "Redis Cache Invalidation", text: "Configured triggers to auto-flush Redis cache categories on administrative write mutations." },
            { icon: "📈", title: "Prometheus Telemetries", text: "Built custom /metrics exporters tracing Node.js memory footprints and CPU loadings." },
            { icon: "📊", title: "Grafana Analytics Panels", text: "Provisioned automated dashboards to visualize server uptime, latencies, and cache metrics." }
        ]
    }
};

// 🖥️ Live Log Console Stream Simulator
const logLines = [
    { text: "🔌 [Database Connection] Attempting MongoDB connection (1/10)...", type: "text-purple", delay: 1000 },
    { text: "❌ [Database Connection] Failed on attempt 1. Error: ECONNREFUSED", type: "text-red", delay: 800 },
    { text: "⏳ [Database Connection] Retrying in 5 seconds...", type: "text-yellow", delay: 800 },
    { text: "🔌 [Database Connection] Attempting MongoDB connection (2/10)...", type: "text-purple", delay: 2000 },
    { text: "✓ [Database Connection] MongoDB connected successfully.", type: "text-green", delay: 600 },
    { text: "🌱 [Database Initialization] Seeding empty menu collection...", type: "text-yellow", delay: 800 },
    { text: "✓ [Database Initialization] Seeded 68 menu items successfully.", type: "text-green", delay: 600 },
    { text: "⚡ [Cache Connection] Connecting to local Redis cache gateway...", type: "", delay: 800 },
    { text: "✓ [Cache Connection] Connected to Redis successfully.", type: "text-green", delay: 500 },
    { text: "📡 [Server Startup] Express.js listening at http://127.0.0.1:4500", type: "text-cyan", delay: 600 },
    { text: "=============================================================", type: "", delay: 400 },
    { text: "🧪 Test 1: Verifying Backend Core Health Indicators (/api/health)...", type: "text-cyan", delay: 1000 },
    { text: "   - HTTP Status: 200", type: "", delay: 300 },
    { text: "   - Services Status: MongoDB: healthy, Redis: healthy", type: "text-green", delay: 300 },
    { text: "   ✅ Health check PASSED!", type: "text-green", delay: 400 },
    { text: "🧪 Test 2: Loading Menu & Verifying Cache Headers (/api/menu)...", type: "text-cyan", delay: 1000 },
    { text: "   - HTTP Status: 200", type: "", delay: 300 },
    { text: "   - Total Loaded Items: 68", type: "", delay: 200 },
    { text: "   - X-Cache Header: HIT", type: "text-purple", delay: 200 },
    { text: "   - Data Source: Redis Cache Gateway", type: "text-purple", delay: 300 },
    { text: "   ✅ Menu integration PASSED!", type: "text-green", delay: 400 },
    { text: "=============================================================", type: "", delay: 400 },
    { text: "🎉 [Verification Complete] ALL DevOps INTEGRATION CHECKS PASSED!", type: "text-green", delay: 500 }
];

let consoleElement = null;

// Initialize functions
document.addEventListener("DOMContentLoaded", () => {
    consoleElement = document.getElementById("console-logs");
    switchWeek(4); // Default to Week 4
    startConsoleSimulation();
});

// Switch Week Tab
function switchWeek(weekNum) {
    // Toggle active state in buttons
    const buttons = document.querySelectorAll(".nav-btn");
    buttons.forEach((btn, idx) => {
        if (idx + 1 === weekNum) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    const data = timelineData[weekNum];
    const card = document.getElementById("week-display-card");

    // Populate timeline content card
    let bulletsHtml = "";
    data.bullets.forEach(b => {
        bulletsHtml += `
            <div class="bullet-item">
                <span class="bullet-icon">${b.icon}</span>
                <div class="bullet-text">
                    <h4>${b.title}</h4>
                    <p>${b.text}</p>
                </div>
            </div>
        `;
    });

    card.innerHTML = `
        <div class="timeline-title">${data.title}</div>
        <div class="timeline-subtitle">${data.subtitle}</div>
        <div class="timeline-body">
            <p>${data.description}</p>
            <div class="timeline-bullets">
                ${bulletsHtml}
            </div>
        </div>
    `;
}

// Stream logs in console
async function startConsoleSimulation() {
    if (!consoleElement) return;
    
    // Clear initial content
    consoleElement.innerHTML = "";
    
    let index = 0;
    
    async function printNextLine() {
        if (index >= logLines.length) {
            // Restart simulation after 5 seconds
            setTimeout(() => {
                startConsoleSimulation();
            }, 6000);
            return;
        }
        
        const line = logLines[index];
        const lineDiv = document.createElement("div");
        lineDiv.className = `log-line ${line.type || ""}`;
        lineDiv.textContent = line.text;
        
        consoleElement.appendChild(lineDiv);
        consoleElement.scrollTop = consoleElement.scrollHeight; // Scroll to bottom
        
        // Dynamic node highlight based on log content
        updateNodeHighlight(line.text);
        
        index++;
        setTimeout(printNextLine, line.delay || 500);
    }
    
    printNextLine();
}

// Update system architecture node highlighting dynamically
function updateNodeHighlight(logText) {
    const nodes = {
        nginx: document.getElementById("node-nginx"),
        backend: document.getElementById("node-backend"),
        redis: document.getElementById("node-redis"),
        mongo: document.getElementById("node-mongo")
    };
    
    // Reset active classes
    Object.values(nodes).forEach(n => {
        if (n) n.style.borderColor = "rgba(255,255,255,0.05)";
    });
    
    // Highlight specific active components based on log statements
    if (logText.includes("Nginx") || logText.includes("Gateway")) {
        highlightNode(nodes.nginx);
    } else if (logText.includes("MongoDB") || logText.includes("DB")) {
        highlightNode(nodes.mongo);
        highlightNode(nodes.backend);
    } else if (logText.includes("Redis") || logText.includes("HIT")) {
        highlightNode(nodes.redis);
        highlightNode(nodes.backend);
    } else if (logText.includes("Express") || logText.includes("API")) {
        highlightNode(nodes.backend);
    } else {
        // Default highlight all active
        Object.values(nodes).forEach(n => {
            if (n) n.style.borderColor = "#3b82f6";
        });
    }
}

function highlightNode(node) {
    if (node) {
        node.style.borderColor = "#60a5fa";
        node.style.boxShadow = "0 0 25px rgba(96, 165, 250, 0.35)";
        setTimeout(() => {
            node.style.boxShadow = "none";
        }, 1000);
    }
}
