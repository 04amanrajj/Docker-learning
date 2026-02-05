// Day 15 StageDock Production Performance Analytics Node
const os = require('os');

console.log('===================================================');
console.log('📦 StageDock Production Telemetry Service Online!');
console.log('===================================================');
console.log(`📡 Container Hostname : ${os.hostname()}`);
console.log(`🐧 Operating System  : ${os.type()} (${os.release()})`);
console.log(`🤖 Node Engine Version: ${process.version}`);
console.log(`👤 Active User PID    : ${process.getuid ? process.getuid() : 'N/A'} (Should be non-zero node user!)`);
console.log('===================================================');

// Simply wait in background to allow size logging inspects
setInterval(() => {
    const memory = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
    console.log(`[stagedock-pulse] Memory consumption in production runtime: ${memory} MB`);
}, 5000);
