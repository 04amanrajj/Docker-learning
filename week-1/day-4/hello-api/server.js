const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

// Request logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url} from ${req.ip}`);
    next();
});

// Hello endpoint
app.get('/', (req, res) => {
    res.json({
        message: "👋 Hello from Dockerized Node.js API!",
        status: "success",
        timestamp: new Date().toISOString(),
        containerDiagnostics: {
            hostname: os.hostname(),
            platform: os.platform(),
            architecture: os.arch(),
            cpuCount: os.cpus().length,
            freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
            totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`
        },
        instructionDetails: {
            workdir: "/app (Set via WORKDIR)",
            exposedPort: `${PORT} (Declared via EXPOSE)`
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: "UP", healthy: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node REST API is active and listening on http://0.0.0.0:${PORT}`);
    console.log(`📂 Running from WORKDIR context inside container`);
});
