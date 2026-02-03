// Day 14 Task Manager Fastify Routing Engine with Postgres & Redis Caching
const fastify = require('fastify')({ logger: false });
const cors = require('@fastify/cors');
const { Pool } = require('pg');
const { createClient } = require('redis');
const os = require('os');

// Register CORS for client access
fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
});

const PORT = process.env.PORT || 5000;
const DB_HOST = process.env.DB_HOST || 'taskmanager-db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgressecret';
const DB_NAME = process.env.DB_NAME || 'postgres';
const REDIS_HOST = process.env.REDIS_HOST || 'taskmanager-redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

// Database Connection
const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: 5432,
    connectionTimeoutMillis: 3000
});

// Redis Cache Connection
const redisClient = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Telemetry state
let totalRequests = 0;
let cacheHits = 0;
let cacheMisses = 0;

// Request logger hook
fastify.addHook('onRequest', async (request, reply) => {
    totalRequests++;
});

// --- REST API ENDPOINTS ---

// 1. Get All Tasks (Reads directly from Postgres)
fastify.get('/api/tasks', async (request, reply) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
        return result.rows;
    } catch (err) {
        reply.code(500);
        return { error: 'Failed to retrieve tasks', details: err.message };
    }
});

// 2. Get Task by ID (Dynamic Caching Layer Strategy!)
fastify.get('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const cacheKey = `task:${id}`;

    try {
        // Step 1: Probe Redis Cache
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            cacheHits++;
            reply.header('X-Cache', 'HIT');
            return JSON.parse(cachedData);
        }

        // Step 2: Cache Miss -> Pull from Postgres
        cacheMisses++;
        const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            reply.code(404);
            return { error: `Task #${id} not found.` };
        }

        const task = result.rows[0];

        // Step 3: Write back to Redis with a 30s TTL
        await redisClient.setEx(cacheKey, 30, JSON.stringify(task));
        reply.header('X-Cache', 'MISS');
        return task;

    } catch (err) {
        reply.code(500);
        return { error: 'Failed to fetch task details', details: err.message };
    }
});

// 3. Create Task (Writes to Postgres & invalidates/purges cache)
fastify.post('/api/tasks', async (request, reply) => {
    const { title, description } = request.body || {};
    
    if (!title) {
        reply.code(400);
        return { error: 'Task title is required.' };
    }

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *',
            [title, description || '', 'pending']
        );
        const newTask = result.rows[0];

        // Purge memory cache list keys if tracking collections (or keep clean entries)
        console.log(`✓ Seeded Task #${newTask.id} in Postgres successfully.`);
        return newTask;
    } catch (err) {
        reply.code(500);
        return { error: 'Failed to create task', details: err.message };
    }
});

// 4. Delete Task (Writes to Postgres & purges matching key from Redis)
fastify.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    const cacheKey = `task:${id}`;

    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            reply.code(404);
            return { error: `Task #${id} does not exist.` };
        }

        // Active cache purge to maintain perfect store consistency!
        await redisClient.del(cacheKey);
        console.log(`✓ Purged Redis Cache key: ${cacheKey}`);

        return { success: true, message: `Task #${id} deleted successfully.` };
    } catch (err) {
        reply.code(500);
        return { error: 'Failed to delete task', details: err.message };
    }
});

// 5. System Health & Diagnostics (Exposes telemetries and cache hits ratio)
fastify.get('/api/diagnostics', async (request, reply) => {
    let dbStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
        await pool.query('SELECT 1');
    } catch (err) {
        dbStatus = 'unhealthy';
    }

    try {
        await redisClient.ping();
    } catch (err) {
        redisStatus = 'unhealthy';
    }

    const hitRate = (cacheHits + cacheMisses) > 0 
        ? Math.round((cacheHits / (cacheHits + cacheMisses)) * 100) 
        : 0;

    return {
        containerHost: os.hostname(),
        uptime: process.uptime(),
        nodeVersion: process.version,
        requestsCount: totalRequests,
        cacheStats: {
            hits: cacheHits,
            misses: cacheMisses,
            hitRatePercent: `${hitRate}%`
        },
        services: {
            postgres: dbStatus,
            redis: redisStatus
        }
    };
});

// Bootstrapper
const start = async () => {
    try {
        // Connect to Redis
        await redisClient.connect();
        console.log('✓ Successfully established link to Redis Cache cluster.');

        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log('===================================================');
        console.log(`🚀 Fastify Task API engine listening on port :${PORT}`);
        console.log(`🐘 Targeting Postgres database: ${DB_HOST}:5432`);
        console.log('===================================================');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
