// PortDock Database Pools - Commit 3
const { Pool } = require('pg');
const Redis = require('ioredis');

// 1. PostgreSQL Connection Pool Setup
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/portdock'
});

// 2. Redis Cache Connection Pool Setup
const redisClient = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

pgPool.on('connect', () => {
    console.log('🐘 PostgreSQL pool connection successfully established.');
});

redisClient.on('connect', () => {
    console.log('🧠 Redis cache connection successfully established.');
});

module.exports = { pgPool, redisClient };
