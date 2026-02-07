// Day 16 SizeDock Layer Inspector Backend API
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to execute local system commands
function executeCommand(cmd) {
    return new Promise((resolve) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) resolve({ success: false, error: stderr || error.message });
            else resolve({ success: true, stdout });
        });
    });
}

// 1. Get Layer statistics endpoint
app.get('/api/layers', async (req, res) => {
    // Probe actual system docker footprints if available
    const imageCheck = await executeCommand('docker image ls | grep sizedock');
    
    let unoptimizedSize = '220 MB';
    let optimizedSize = '193 MB';
    let systemMode = 'simulated';

    if (imageCheck.success && imageCheck.stdout) {
        systemMode = 'live';
        // Extract dynamically if running on local system
        const lines = imageCheck.stdout.split('\n');
        lines.forEach(line => {
            if (line.includes('unoptimized')) {
                const parts = line.replace(/\s+/g, ' ').trim().split(' ');
                if (parts.length >= 4) unoptimizedSize = parts[parts.length - 1] + ' ' + parts[parts.length - 2];
            }
            if (line.includes('optimized') && !line.includes('unoptimized')) {
                const parts = line.replace(/\s+/g, ' ').trim().split(' ');
                if (parts.length >= 4) optimizedSize = parts[parts.length - 1] + ' ' + parts[parts.length - 2];
            }
        });
    }

    // High fidelity layer details for unoptimized image
    const unoptimizedLayers = [
        { command: 'CMD ["node" "app.js"]', size: '0 B', type: 'instruction' },
        { command: 'EXPOSE [3000/tcp]', size: '0 B', type: 'instruction' },
        { command: 'RUN rm heavy-bundle.tar.gz', size: '16.4 kB', description: '🚨 Metadata deletion only! Space not reclaimed!', highlight: true },
        { command: 'RUN dd if=/dev/zero of=heavy-bundle.tar.gz bs=1M count=25', size: '26.2 MB', description: '⚠️ Blob generated in independent layer. Permanently immutable.', highlight: true },
        { command: 'COPY . .', size: '24.6 kB', type: 'source' },
        { command: 'RUN npm ci', size: '20.5 kB', type: 'dependencies' },
        { command: 'WORKDIR /usr/src/app', size: '16.4 kB', type: 'setup' },
        { command: 'Alpine Node:20-alpine OS layers', size: '193 MB', type: 'base' }
    ];

    // High fidelity layer details for optimized image
    const optimizedLayers = [
        { command: 'CMD ["node" "app.js"]', size: '0 B', type: 'instruction' },
        { command: 'EXPOSE [3000/tcp]', size: '0 B', type: 'instruction' },
        { command: 'RUN dd if=/dev/zero ... && rm heavy-bundle.tar.gz', size: '4.1 kB', description: '✓ Chained run and cleanup. Bundle completely purged from history!', highlight: true },
        { command: 'COPY . .', size: '24.6 kB', type: 'source' },
        { command: 'RUN npm ci', size: '20.5 kB', type: 'dependencies' },
        { command: 'WORKDIR /usr/src/app', size: '16.4 kB', type: 'setup' },
        { command: 'Alpine Node:20-alpine OS layers', size: '193 MB', type: 'base' }
    ];

    res.json({
        engineMode: systemMode,
        summary: {
            unoptimized: unoptimizedSize,
            optimized: optimizedSize,
            savedBytes: '26.2 MB',
            percentageSaved: '12.3%'
        },
        images: {
            unoptimized: unoptimizedLayers,
            optimized: optimizedLayers
        }
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`📡 SizeDock Footprint API listening on port :${PORT}`);
    console.log('===================================================');
});
