// Day 10: Advanced TimeDock Express API & PostgreSQL Tracker Engine
const express = require('express');
const { Pool } = require('pg');
const os = require('os');
const app = express();

app.use(express.json());

// Dynamic CORS Headers to support multi-node microservices architecture
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
const DB_HOST = process.env.DB_HOST || 'timedock-db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgressecret';
const DB_NAME = process.env.DB_NAME || 'postgres';
const DB_PORT = process.env.DB_PORT || 5432;

let dbPool = null;
let dbConnected = false;

// Resilient Postgres connection loader
async function connectPostgres(retries = 10, delay = 3000) {
    const dbConfig = {
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT
    };

    console.log(`📡 Connecting to PostgreSQL at: postgres://${DB_USER}:****@${DB_HOST}:${DB_PORT}/${DB_NAME}`);

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            dbPool = new Pool(dbConfig);
            await dbPool.query('SELECT NOW()');
            dbConnected = true;
            console.log(`🎉 Success! PostgreSQL database connected on attempt #${attempt}.`);
            
            // Generate table schema
            await dbPool.query(`
                CREATE TABLE IF NOT EXISTS time_entries (
                    id SERIAL PRIMARY KEY,
                    project_name VARCHAR(100) NOT NULL,
                    task_description VARCHAR(255) NOT NULL,
                    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    end_time TIMESTAMP,
                    duration_seconds INT DEFAULT 0
                );
            `);
            return;
        } catch (err) {
            console.error(`❌ Attempt #${attempt}/${retries} failed. Retrying in ${delay / 1000}s...`);
            if (dbPool) await dbPool.end();
            dbConnected = false;
            await new Promise(res => setTimeout(res, delay));
        }
    }
    console.error("🚨 Critical Error: Could not connect to Postgres DB after maximum retries.");
}

connectPostgres();

// --- API CRUD CHANNELS ---

// Get all trackers
app.get('/api/timers', async (req, res) => {
    if (!dbConnected) return res.status(503).json({ error: "PostgreSQL Database Offline." });
    try {
        const result = await dbPool.query('SELECT * FROM time_entries ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to query database." });
    }
});

// Start new time tracker
app.post('/api/timers', async (req, res) => {
    if (!dbConnected) return res.status(503).json({ error: "PostgreSQL Database Offline." });
    const { project_name, task_description } = req.body;
    
    if (!project_name || !task_description) {
        return res.status(400).json({ error: "Project name and description are required." });
    }

    try {
        const result = await dbPool.query(
            'INSERT INTO time_entries (project_name, task_description, start_time) VALUES ($1, $2, NOW()) RETURNING *',
            [project_name.trim(), task_description.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to write database record." });
    }
});

// Stop active time tracker
app.put('/api/timers/:id/stop', async (req, res) => {
    if (!dbConnected) return res.status(503).json({ error: "PostgreSQL Database Offline." });
    const timerId = parseInt(req.params.id);

    try {
        // Query database, calculate elapsed duration seconds dynamically
        const result = await dbPool.query(
            `UPDATE time_entries 
             SET end_time = NOW(), 
                 duration_seconds = EXTRACT(EPOCH FROM (NOW() - start_time))::int 
             WHERE id = $1 AND end_time IS NULL 
             RETURNING *`,
            [timerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Active timer not found or already stopped." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update record." });
    }
});

// Delete time entry
app.delete('/api/timers/:id', async (req, res) => {
    if (!dbConnected) return res.status(503).json({ error: "PostgreSQL Database Offline." });
    const timerId = parseInt(req.params.id);

    try {
        const result = await dbPool.query('DELETE FROM time_entries WHERE id = $1 RETURNING *', [timerId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Time entry not found." });
        }
        res.json({ success: true, message: `Time entry #${timerId} cleared.` });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to delete record." });
    }
});

// Telemetry Diagnostics
app.get('/api/diagnostics', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbVersion = 'N/A';
    
    if (dbConnected) {
        try {
            const result = await dbPool.query("SELECT version()");
            dbStatus = 'healthy';
            dbVersion = result.rows[0].version;
        } catch (e) {
            dbStatus = 'error';
        }
    }

    res.json({
        containerHost: os.hostname(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        database: {
            status: dbStatus,
            host: DB_HOST,
            name: DB_NAME,
            engine: 'PostgreSQL 16',
            version: dbVersion
        }
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`⏱️ TimeDock Backend Listening on Port :${PORT}`);
    console.log(`🔌 Database Host endpoint: ${DB_HOST}:${DB_PORT}`);
    console.log('===================================================');
});
