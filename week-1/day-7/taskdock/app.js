// TaskDock Capstone - Express API Server & Persistent File Database
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Environment Variables with sensible defaults
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const APP_OWNER = process.env.APP_OWNER || 'Developer';
const THEME_GLOW = process.env.THEME_GLOW || '#0db7ed';
const DB_FILE_PATH = process.env.DB_FILE_PATH || path.join(__dirname, 'tasks.json');

// Ensure database directory and file exist with sample items
function initializeDatabase() {
    const dbDir = path.dirname(DB_FILE_PATH);
    
    // Create database directory if it does not exist (e.g. /data volume)
    if (!fs.existsSync(dbDir)) {
        try {
            fs.mkdirSync(dbDir, { recursive: true });
            console.log(`✓ Created database directory: ${dbDir}`);
        } catch (err) {
            console.error(`❌ Failed to create database directory: ${err.message}`);
        }
    }

    // Preseed sample tasks if db file is missing or empty
    if (!fs.existsSync(DB_FILE_PATH) || fs.readFileSync(DB_FILE_PATH, 'utf8').trim() === "") {
        const seedTasks = [
            { id: 1, title: 'Configure Multi-stage Dockerfile Builder', status: 'done', date: '2026-01-06' },
            { id: 2, title: 'Implement Named Volume Persistence Mount', status: 'in-progress', date: '2026-01-06' },
            { id: 3, title: 'Harden security using non-root USER node privileges', status: 'todo', date: '2026-01-06' }
        ];
        try {
            fs.writeFileSync(DB_FILE_PATH, JSON.stringify(seedTasks, null, 2), 'utf8');
            console.log("✓ Pre-seeded task database with Capstone defaults.");
        } catch (err) {
            console.error(`❌ Failed to seed database: ${err.message}`);
        }
    }
}

// Read helper
function getTasks() {
    try {
        if (!fs.existsSync(DB_FILE_PATH)) return [];
        const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`❌ Error reading database: ${err.message}`);
        return [];
    }
}

// Write helper
function saveTasks(tasks) {
    try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(tasks, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`❌ Error writing database: ${err.message}`);
        return false;
    }
}

// Initialize database at launch
initializeDatabase();

// --- REST API ENDPOINTS ---

// Query all tasks
app.get('/api/tasks', (req, res) => {
    res.json(getTasks());
});

// Create a new task
app.post('/api/tasks', (req, res) => {
    const { title } = req.body;
    if (!title || title.trim() === "") {
        return res.status(400).json({ error: "Task title cannot be blank." });
    }

    const tasks = getTasks();
    const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const newTask = {
        id: newId,
        title: title.trim(),
        status: 'todo',
        date: new Date().toISOString().substring(0, 10)
    };

    tasks.push(newTask);
    if (saveTasks(tasks)) {
        res.status(201).json(newTask);
    } else {
        res.status(500).json({ error: "Failed to save transaction to database." });
    }
});

// Update task status
app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    const tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task not found." });
    }

    tasks[taskIndex].status = status;
    if (saveTasks(tasks)) {
        res.json(tasks[taskIndex]);
    } else {
        res.status(500).json({ error: "Failed to write transaction update." });
    }
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = getTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);

    if (tasks.length === filteredTasks.length) {
        return res.status(404).json({ error: "Task not found." });
    }

    if (saveTasks(filteredTasks)) {
        res.json({ success: true, message: `Task ${taskId} removed permanently.` });
    } else {
        res.status(500).json({ error: "Failed to delete item from database file." });
    }
});

// Get container logs diagnostics details
app.get('/api/diagnostics', (req, res) => {
    // Check write permissions on the data directory
    let isWritable = false;
    try {
        fs.accessSync(path.dirname(DB_FILE_PATH), fs.constants.W_OK);
        isWritable = true;
    } catch (e) {
        isWritable = false;
    }

    // Get current process user info (UID/GID if on linux)
    let processUser = "unknown";
    try {
        processUser = `${process.getuid ? process.getuid() : 'N/A'}:${process.getgid ? process.getgid() : 'N/A'}`;
    } catch (e) {
        processUser = "Windows Host Environment";
    }

    res.json({
        status: 'online',
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: process.platform,
        processUidGid: processUser,
        envProfile: {
            nodeEnv: NODE_ENV,
            appOwner: APP_OWNER,
            themeGlow: THEME_GLOW,
            port: PORT
        },
        database: {
            filePath: DB_FILE_PATH,
            directoryWritable: isWritable,
            recordsCount: getTasks().length
        }
    });
});

// Boot listening daemon
app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🐳 TaskDock Full-Stack Daemon Booted successfully.`);
    console.log(`🌍 Active Mode    : ${NODE_ENV}`);
    console.log(`🔑 App Administrator: ${APP_OWNER}`);
    console.log(`📁 Persistent DB  : ${DB_FILE_PATH}`);
    console.log(`🔌 Exposed Port   : ${PORT}`);
    console.log(`🛡️ Process UID:GID: ${process.getuid ? process.getuid() : 'N/A'}:${process.getgid ? process.getgid() : 'N/A'}`);
    console.log('===================================================');
});
