// Docker Multi-Container Bridge Networking - Day 8
const express = require('express');
const redis = require('redis');
const dns = require('dns');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || 'cache-db';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

let redisConnected = false;
let redisClient = null;
let inMemoryCounter = 0;

// Initialize Redis Client
async function connectRedis() {
    const redisUrl = `redis://${REDIS_HOST}:${REDIS_PORT}`;
    console.log(`📡 Attempting Redis connection at: ${redisUrl}`);
    
    redisClient = redis.createClient({
        url: redisUrl,
        socket: {
            connectTimeout: 3000,
            reconnectStrategy: (retries) => {
                if (retries > 2) {
                    console.log("❌ Redis unreachable. Falling back to secure in-memory database cluster.");
                    redisConnected = false;
                    return false; // Stop retrying
                }
                return 1000; // Retry after 1s
            }
        }
    });

    redisClient.on('error', (err) => {
        // Suppress massive connection failure logs
        redisConnected = false;
    });

    redisClient.on('connect', () => {
        console.log("✓ Established socket connection to Redis endpoint.");
    });

    redisClient.on('ready', () => {
        console.log("🎉 Redis connection fully authenticated and ready!");
        redisConnected = true;
    });

    try {
        await redisClient.connect();
    } catch (err) {
        redisConnected = false;
    }
}

connectRedis();

// --- REST API ENDPOINTS ---

// Query visit statistics counter
app.get('/api/visits', async (req, res) => {
    if (redisConnected) {
        try {
            const count = await redisClient.incr('visits');
            return res.json({
                storageEngine: 'Redis Cache Container',
                visitsCount: parseInt(count),
                connected: true,
                host: REDIS_HOST
            });
        } catch (err) {
            console.error(`❌ Redis operations failed: ${err.message}`);
        }
    }

    // Graceful fallback to local RAM memory database
    inMemoryCounter++;
    res.json({
        storageEngine: 'Fallback In-Memory Storage',
        visitsCount: inMemoryCounter,
        connected: false,
        host: 'localhost (Fallback)',
        warning: 'Redis isolated or offline. Custom bridge network connection required.'
    });
});

// Inspect active DNS resolution inside Custom Bridge Network
app.get('/api/network-status', (req, res) => {
    dns.lookup(REDIS_HOST, (err, address, family) => {
        if (err) {
            return res.json({
                status: 'degraded',
                dnsDiscovery: 'failed',
                targetHost: REDIS_HOST,
                error: `Unable to resolve host ${REDIS_HOST} automatically. DNS resolution failed.`,
                tip: 'Ensure both containers are actively joined to the custom Docker Bridge network.'
            });
        }

        res.json({
            status: 'optimal',
            dnsDiscovery: 'successful',
            targetHost: REDIS_HOST,
            resolvedIpAddress: address,
            ipFamily: `IPv${family}`,
            details: `Docker DNS engine successfully mapped service '${REDIS_HOST}' to container IP ${address}.`
        });
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🚀 Multi-Container API booted successfully.`);
    console.log(`🔌 Listening Port: ${PORT}`);
    console.log(`📡 Targets Redis  : ${REDIS_HOST}:${REDIS_PORT}`);
    console.log('===================================================');
});
