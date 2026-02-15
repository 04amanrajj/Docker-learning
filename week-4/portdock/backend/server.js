// PortDock Fastify Server Core with Redis Caching - Commit 5
const Fastify = require('fastify');
const cors = require('@fastify/cors');
const { pgPool, redisClient } = require('./database');
const { initializeDatabase } = require('./init-db');

const fastify = Fastify({ logger: true });

// Setup CORS
fastify.register(cors, { origin: true });

// Global cache metrics store
let cacheHits = 0;
let cacheMisses = 0;

// Standard System Healthcheck Endpoint
fastify.get('/health', async (request, reply) => {
    return { status: 'OK', uptime: process.uptime() };
});

// Cache Metrics Endpoint
fastify.get('/api/cache-status', async (request, reply) => {
    try {
        const dbsize = await redisClient.dbsize();
        return {
            success: true,
            totalHits: cacheHits,
            totalMisses: cacheMisses,
            activeCachedKeys: dbsize,
            ratio: cacheHits + cacheMisses === 0 ? 0 : (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1) + '%'
        };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

// 1. GET /api/tasks: Reads from Redis cache, or fallbacks to DB on cache-miss
fastify.get('/api/tasks', async (request, reply) => {
    const CACHE_KEY = 'portfolio_tasks_list';
    try {
        // Probe Redis Cache first
        const cachedData = await redisClient.get(CACHE_KEY);
        if (cachedData) {
            cacheHits++;
            console.log('⚡ [Redis Cache HIT] Serving tasks list from in-memory cache.');
            return { success: true, cache: 'HIT', totalHits: cacheHits, totalMisses: cacheMisses, data: JSON.parse(cachedData) };
        }

        // Cache Miss: Query Postgres
        cacheMisses++;
        console.log('🐘 [PostgreSQL Cache MISS] Querying tasks from relational database...');
        const dbResult = await pgPool.query('SELECT * FROM portfolio_tasks ORDER BY id ASC');
        
        // Save back to Redis Cache with 60s TTL
        await redisClient.setex(CACHE_KEY, 60, JSON.stringify(dbResult.rows));
        
        return { success: true, cache: 'MISS', totalHits: cacheHits, totalMisses: cacheMisses, data: dbResult.rows };
    } catch (err) {
        reply.status(500);
        return { success: false, error: err.message };
    }
});

// Helper: invalidate tasks cache key
async function flushCache() {
    await redisClient.del('portfolio_tasks_list');
    console.log('🧹 [Redis Invalidation] Cache key portfolio_tasks_list flushed.');
}

// 2. POST /api/tasks: Creates new task, immediately invalidates Redis Cache
fastify.post('/api/tasks', async (request, reply) => {
    const { title, description } = request.body || {};
    if (!title) {
        reply.status(400);
        return { success: false, error: 'Title field is required' };
    }
    try {
        const query = 'INSERT INTO portfolio_tasks (title, description) VALUES ($1, $2) RETURNING *';
        const res = await pgPool.query(query, [title, description || '']);
        
        // Invalidate cache immediately on write to maintain strict consistency
        await flushCache();
        
        return { success: true, data: res.rows[0] };
    } catch (err) {
        reply.status(500);
        return { success: false, error: err.message };
    }
});

// 3. PUT /api/tasks/:id/complete: Marks task complete, invalidates cache
fastify.put('/api/tasks/:id/complete', async (request, reply) => {
    const { id } = request.params;
    try {
        const query = 'UPDATE portfolio_tasks SET completed = true WHERE id = $1 RETURNING *';
        const res = await pgPool.query(query, [id]);
        
        if (res.rows.length === 0) {
            reply.status(404);
            return { success: false, error: 'Task not found' };
        }

        await flushCache();
        
        return { success: true, data: res.rows[0] };
    } catch (err) {
        reply.status(500);
        return { success: false, error: err.message };
    }
});

// 4. DELETE /api/tasks/:id: Removes task, invalidates cache
fastify.delete('/api/tasks/:id', async (request, reply) => {
    const { id } = request.params;
    try {
        const query = 'DELETE FROM portfolio_tasks WHERE id = $1 RETURNING *';
        const res = await pgPool.query(query, [id]);
        
        if (res.rows.length === 0) {
            reply.status(404);
            return { success: false, error: 'Task not found' };
        }

        await flushCache();
        
        return { success: true, message: 'Task deleted successfully' };
    } catch (err) {
        reply.status(500);
        return { success: false, error: err.message };
    }
});

const start = async () => {
    try {
        // Run PostgreSQL relational schema migrations
        await initializeDatabase();
        
        const PORT = process.env.PORT || 5000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`⚡ Fastify PortDock server listening on port :${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = { fastify };
