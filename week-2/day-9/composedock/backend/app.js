// Day 9: Compose Express REST API with Resilient PostgreSQL Connection Retries
const express = require('express');
const { Pool } = require('pg');
const os = require('os');
const app = express();

app.use(express.json());

// Enable loose CORS headers for dynamic Multi-Node Docker Architecture queries
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
const DB_HOST = process.env.DB_HOST || 'compose-db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgressecret';
const DB_NAME = process.env.DB_NAME || 'postgres';
const DB_PORT = process.env.DB_PORT || 5432;

let dbPool = null;
let dbConnected = false;

// Resilient connection retries helper to prevent race condition crashes
async function initializePostgresConnection(retries = 10, delay = 3000) {
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
            // Verify connection with simple query
            await dbPool.query('SELECT NOW()');
            dbConnected = true;
            console.log(`🎉 Success! PostgreSQL database connected on attempt #${attempt}.`);
            
            // Ensure table exists (fail-safe if init.sql didn't execute)
            await dbPool.query(`
                CREATE TABLE IF NOT EXISTS compose_tasks (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    status VARCHAR(50) DEFAULT 'todo',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            return;
        } catch (err) {
            console.error(`❌ Attempt #${attempt}/${retries} failed: Database unreachable. Retrying in ${delay / 1000}s...`);
            if (dbPool) {
                await dbPool.end();
            }
            dbConnected = false;
            // Sleep
            await new Promise(res => setTimeout(res, delay));
        }
    }

    console.error("🚨 Critical Error: Failed to connect to PostgreSQL database after multiple connection retries. Falling back to degraded mode.");
}

initializePostgresConnection();

// --- API ENDPOINTS ---

// Fetch tasks
app.get('/api/tasks', async (req, res) => {
    if (!dbConnected) {
        return res.status(503).json({ error: "PostgreSQL Database offline. Attempting connection retries." });
    }
    try {
        const result = await dbPool.query('SELECT * FROM compose_tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to query database." });
    }
});

// Create task
app.post('/api/tasks', async (req, res) => {
    if (!dbConnected) {
        return res.status(503).json({ error: "PostgreSQL Database offline." });
    }
    const { title } = req.body;
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Task title cannot be blank." });
    }

    try {
        const result = await dbPool.query(
            'INSERT INTO compose_tasks (title, status) VALUES ($1, $2) RETURNING *',
            [title.trim(), 'todo']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to write database record." });
    }
});

// Update task status
app.put('/api/tasks/:id', async (req, res) => {
    if (!dbConnected) {
        return res.status(503).json({ error: "PostgreSQL Database offline." });
    }
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    try {
        const result = await dbPool.query(
            'UPDATE compose_tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, taskId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to update record." });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    if (!dbConnected) {
        return res.status(503).json({ error: "PostgreSQL Database offline." });
    }
    const taskId = parseInt(req.params.id);

    try {
        const result = await dbPool.query('DELETE FROM compose_tasks WHERE id = $1 RETURNING *', [taskId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found." });
        }
        res.json({ success: true, message: `Task ${taskId} removed permanently.` });
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
    console.log(`🐳 Compose Node Backend listening on Port :${PORT}`);
    console.log(`🔌 Database Endpoint: ${DB_HOST}:${DB_PORT}`);
    console.log(`🔒 Process Owner UID: ${process.getuid ? process.getuid() : 'N/A'}`);
    console.log('===================================================');
});
