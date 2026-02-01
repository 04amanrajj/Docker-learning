// Day 13 LogDock Dynamic Logging Engine
const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_DIR = path.join(__dirname, 'logs');
const AUDIT_FILE = path.join(LOG_DIR, 'internal-audit.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Seed the internal audit file
fs.writeFileSync(AUDIT_FILE, `=== LogDock Audit Initiated at ${new Date().toISOString()} ===\n`);

console.log('===================================================');
console.log('📜 LogDock Interactive Logging Engine is Online!');
console.log(`📡 Host Container ID : ${os.hostname()}`);
console.log(`📁 Internal Audit log: ${AUDIT_FILE}`);
console.log('===================================================');

let pulseCount = 0;

// Log writer helper
function writeAudit(level, message) {
    const entry = `[${new Date().toISOString()}] [${level}] ${message}\n`;
    fs.appendFileSync(AUDIT_FILE, entry);
}

// 1. Core heartbeat logs (INFO level -> stdout)
setInterval(() => {
    pulseCount++;
    const memoryUsage = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
    
    const infoMsg = `INFO: LogDock engine pulse #${pulseCount}. Current active heap: ${memoryUsage} MB.`;
    console.log(infoMsg);
    writeAudit('INFO', `Heap utilization tracked at ${memoryUsage} MB.`);
}, 3000);

// 2. Telemetry and Buffer flushes (DEBUG level -> stdout)
setInterval(() => {
    const debugMsg = `DEBUG: Garbage Collector audit triggered. Active thread pool workers: 4. Flushed ephemeral network cache.`;
    console.log(debugMsg);
    writeAudit('DEBUG', 'GC triggered. Network cache buffer flushed.');
}, 8000);

// 3. System warnings (WARN level -> stdout)
setInterval(() => {
    const randomMemoryPercent = Math.floor(Math.random() * 20) + 65; // 65% to 85%
    if (randomMemoryPercent > 78) {
        const warnMsg = `WARN: Memory threshold alert! High cache page allocation detected at ${randomMemoryPercent}%.`;
        console.warn(warnMsg);
        writeAudit('WARN', `Memory saturation exceeded threshold: ${randomMemoryPercent}%.`);
    }
}, 12000);

// 4. Critical Errors (ERROR level -> stderr)
setInterval(() => {
    const errorsList = [
        "DB_CONNECTION_TIMEOUT: PostgreSQL connection dropped on port 5432.",
        "REDIS_CACHE_MISS: Failed to write voting registry key 'compose' to memory socket.",
        "STATIC_ASSET_404: Nginx static file style.css requested but not resolved."
    ];
    const pickedError = errorsList[Math.floor(Math.random() * errorsList.length)];
    
    // Writes directly to stderr stream
    console.error(`ERROR: ${pickedError}`);
    writeAudit('ERROR', pickedError);
}, 20000);
