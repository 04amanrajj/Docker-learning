// Day 20 MonitorDock Express Exporter Backend
const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ---------------------------------------------------
// 📊 PROMETHEUS METRICS SETUP
// ---------------------------------------------------
const registry = new client.Registry();

// Enable default runtime system metrics (CPU, Memory, Event Loop Lag)
client.collectDefaultMetrics({ register: registry, prefix: 'node_app_' });

// Custom request counter
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests processed',
    labelNames: ['method', 'route', 'status'],
    registers: [registry]
});

// Custom active sessions gauge
const activeSessionsGauge = new client.Gauge({
    name: 'active_sessions',
    help: 'Number of active simulated user sessions in app memory',
    registers: [registry]
});

// Custom database query duration histogram
const dbQueryDuration = new client.Histogram({
    name: 'db_query_duration_seconds',
    help: 'Duration of PostgreSQL queries in seconds',
    buckets: [0.01, 0.05, 0.1, 0.5, 1.0],
    registers: [registry]
});

// Initialize session simulation metrics
activeSessionsGauge.set(128); // start with a healthy simulated user pool

// ---------------------------------------------------
// 🗄️ DATABASE CONNECTION
// ---------------------------------------------------
const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/monitordock'
});

// Seed table on start
async function initDb() {
    try {
        await pgPool.query('CREATE TABLE IF NOT EXISTS system_logs (id SERIAL PRIMARY KEY, event TEXT, created_at TIMESTAMP DEFAULT NOW())');
        await pgPool.query('INSERT INTO system_logs (event) VALUES (\'System bootstrap monitoring online\')');
        console.log('✓ Database tables seeded.');
    } catch (err) {
        console.warn('[DB Error] Failed setup:', err.message);
    }
}
initDb();

// ---------------------------------------------------
// 📡 ROUTING & MIDDLEWARE
// ---------------------------------------------------
app.use((req, res, next) => {
    res.on('finish', () => {
        // Log request counter automatically
        httpRequestCounter.labels(req.method, req.route ? req.route.path : req.path, res.statusCode).inc();
    });
    next();
});

// Base testing route
app.get('/api/data', async (req, res) => {
    const end = dbQueryDuration.startTimer();
    try {
        const result = await pgPool.query('SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 5');
        end(); // stop DB duration timer
        res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        end();
        res.status(500).json({ success: false, error: err.message });
    }
});

// Simulated route adding/removing user sessions dynamically to change gauges
app.post('/api/session', (req, res) => {
    const action = req.body.action || 'login';
    if (action === 'login') {
        activeSessionsGauge.inc();
    } else {
        activeSessionsGauge.dec();
    }
    res.json({ success: true, activeSessions: activeSessionsGauge.get() });
});

// ---------------------------------------------------
// 📡 PROMETHEUS SCRAPE ENDPOINT
// ---------------------------------------------------
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', registry.contentType);
    res.send(await registry.metrics());
});

app.listen(PORT, () => {
    console.log(`📊 Observable Telemetry App online on port :${PORT}`);
});
