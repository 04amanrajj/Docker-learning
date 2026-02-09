// Day 18 ProdDock Hardened Telemetry API
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enable loose fallback config
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/proddock'
});

const redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://cache:6379'
});
redisClient.connect().catch(err => console.error('Redis connection error:', err));

// Telemetry check serving resource logs & security status
app.get('/api/telemetry', async (req, res) => {
    let dbStatus = "HEALTHY";
    let cacheStatus = "HEALTHY";

    // Test DB ping
    try {
        await pgPool.query('SELECT 1');
    } catch (err) {
        dbStatus = "UNHEALTHY (Connection failed)";
    }

    // Test Cache ping
    try {
        await redisClient.ping();
    } catch (err) {
        cacheStatus = "UNHEALTHY (Connection failed)";
    }

    // Calculate memory allocations in megabytes
    const memoryUsage = process.memoryUsage();
    const rssMB = Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100;
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100;
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100;

    // Detect non-root execution (process.getuid returns uid of execution context)
    const currentUid = typeof process.getuid === 'function' ? process.getuid() : -1;
    const isRoot = currentUid === 0;

    res.json({
        success: true,
        service: "proddock-app",
        securityStatus: {
            userContextUID: currentUid,
            isRunningAsRoot: isRoot,
            rootWarningState: isRoot ? "🚨 CRITICAL WARNING: Executing app server as ROOT!" : "✓ SECURE: Executing as non-root unprivileged Node runtime user."
        },
        resourceFootprint: {
            rssMB,
            heapTotalMB,
            heapUsedMB,
            memoryLimitMB: 256 // Defined limit in compose deploy settings
        },
        servicesHealth: {
            appNode: "HEALTHY",
            databasePostgres: dbStatus,
            cacheRedis: cacheStatus
        },
        systemTime: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`📡 Hardened Telemetry app online on port :${PORT}`);
});
