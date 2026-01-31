// Day 12 Healthdock REST Server with Manual DB Crash Toggle Mocking
const express = require('express');
const { Pool } = require('pg');
const os = require('os');
const app = express();

app.use(express.json());

// CORS configuration for multi-node web architectures
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || 'healthdock-db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgressecret';
const DB_NAME = process.env.DB_NAME || 'postgres';

// Setup connection details
const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: 5432,
    connectionTimeoutMillis: 2000
});

// Dynamic status variables
let databaseOnline = true; // User can manually "crash" it to test healthchecks
let totalRequests = 0;

// Request logger middleware
app.use((req, res, next) => {
    totalRequests++;
    next();
});

// --- API ENDPOINTS ---

// 🩺 HEALTHCHECK TARGET: Probed by Docker Compose Healthcheck daemon
app.get('/health', async (req, res) => {
    console.log("🩺 Docker daemon is running container health check...");

    // Check 1: User toggle check (simulates fatal process or state failure)
    if (!databaseOnline) {
        console.warn("❌ Health probe failed: Database simulated failure active.");
        return res.status(500).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: "Simulated database connection failure active."
        });
    }

    // Check 2: Actual PostgreSQL check
    try {
        const client = await pool.connect();
        const queryRes = await client.query('SELECT NOW()');
        client.release();
        
        console.log("✓ Health probe passed successfully.");
        res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            checks: {
                database: "connected",
                responseTime: "ok"
            }
        });
    } catch (err) {
        console.error("❌ Health probe failed: Postgres unreachable.", err.message);
        res.status(500).json({
            status: "unhealthy",
            timestamp: new Date().toISOString(),
            error: `PostgreSQL connection failed: ${err.message}`
        });
    }
});

// ⚡ MANUAL FATAL FAIL TRIGGER: Allows users to dynamically toggle the health check
app.post('/api/toggle-database', (req, res) => {
    databaseOnline = !databaseOnline;
    console.log(`===================================================`);
    console.log(`⚠️ Database Online state manually set to: ${databaseOnline.toString().toUpperCase()}`);
    console.log(`===================================================`);
    res.json({
        success: true,
        databaseOnline,
        status: databaseOnline ? "healthy" : "simulated_crash_active"
    });
});

// General app telemetry stats
app.get('/api/diagnostics', (req, res) => {
    res.json({
        containerHost: os.hostname(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        totalRequests,
        database: {
            host: DB_HOST,
            state: databaseOnline ? "active" : "offline_simulated",
            healthcheck: "/health"
        }
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🩺 Healthdock Resilient Server Active on Port :${PORT}`);
    console.log(`📡 Targeting Database: ${DB_HOST}:5432`);
    console.log('===================================================');
});
