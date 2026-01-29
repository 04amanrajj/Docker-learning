// Day 11: High-speed Real-time Voting API backed by Redis Cache
const express = require('express');
const redis = require('redis');
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
const REDIS_HOST = process.env.REDIS_HOST || 'redipoll-cache';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisClient = null;
let redisConnected = false;

// Initialize Redis Connection with retry fallbacks
async function initializeRedis() {
    const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
    console.log(`📡 Connecting to Redis cache at: ${redisUrl}`);

    redisClient = redis.createClient({
        url: redisUrl,
        socket: {
            connectTimeout: 3000,
            reconnectStrategy: (retries) => {
                if (retries > 5) {
                    console.log("❌ Redis unreachable. Disabling real-time registration.");
                    redisConnected = false;
                    return false;
                }
                return 2000;
            }
        }
    });

    redisClient.on('error', (err) => {
        redisConnected = false;
    });

    redisClient.on('ready', () => {
        console.log("🎉 Redis connection successfully authenticated and ready!");
        redisConnected = true;
    });

    try {
        await redisClient.connect();
    } catch (e) {
        redisConnected = false;
    }
}

initializeRedis();

// Candidates for Docker opinion polls
const CANDIDATES = ['compose', 'multistage', 'networking'];

// Seed candidates in Redis if they don't exist
async function seedCandidates() {
    if (!redisConnected) return;
    try {
        for (const candidate of CANDIDATES) {
            const val = await redisClient.get(`votes:${candidate}`);
            if (val === null) {
                await redisClient.set(`votes:${candidate}`, '0');
            }
        }
    } catch (err) {
        console.error("Failed to seed candidates", err);
    }
}

// Check connection periodically to seed candidates
setInterval(() => {
    if (redisConnected) seedCandidates();
}, 5000);

// --- API ENDPOINTS ---

// Fetch voting results
app.get('/api/votes', async (req, res) => {
    if (!redisConnected) {
        return res.status(503).json({ error: "Redis Cache offline." });
    }

    try {
        const results = {};
        for (const candidate of CANDIDATES) {
            const count = await redisClient.get(`votes:${candidate}`);
            results[candidate] = parseInt(count || 0);
        }
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read cache keys." });
    }
});

// Cast a vote
app.post('/api/votes/:candidate', async (req, res) => {
    if (!redisConnected) {
        return res.status(503).json({ error: "Redis Cache offline." });
    }

    const { candidate } = req.params;
    if (!CANDIDATES.includes(candidate)) {
        return res.status(400).json({ error: "Invalid voting candidate." });
    }

    try {
        const count = await redisClient.incr(`votes:${candidate}`);
        res.json({ success: true, candidate, votes: parseInt(count) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to write cache keys." });
    }
});

// Reset voting counts
app.delete('/api/votes', async (req, res) => {
    if (!redisConnected) {
        return res.status(503).json({ error: "Redis Cache offline." });
    }

    try {
        for (const candidate of CANDIDATES) {
            await redisClient.set(`votes:${candidate}`, '0');
        }
        res.json({ success: true, message: "All voting counters reset to zero." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to reset cache keys." });
    }
});

// Telemetry Diagnostics
app.get('/api/diagnostics', (req, res) => {
    res.json({
        containerHost: os.hostname(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        cache: {
            status: redisConnected ? 'healthy' : 'disconnected',
            host: REDIS_HOST,
            port: REDIS_PORT,
            engine: 'Redis 7-Alpine'
        }
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`⚡ RediPoll Express API Listening on Port :${PORT}`);
    console.log(`🔌 Redis Target Host: ${REDIS_HOST}:${REDIS_PORT}`);
    console.log('===================================================');
});
