// Docker Learning Sandbox - Day 6: Environment Variables Server
const express = require('express');
const app = express();

// Read dynamic environment parameters (with sensible fallbacks)
const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || 'production';
const WELCOME_MESSAGE = process.env.WELCOME_MESSAGE || 'Hello from Docker Sandbox!';
const THEME_COLOR = process.env.THEME_COLOR || '#0db7ed';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const API_KEY = process.env.API_KEY ? '••••••••••••••••' : 'NOT_SET';

app.get('/', (req, res) => {
    res.json({
        status: 'active',
        message: WELCOME_MESSAGE,
        config: {
            environment: APP_ENV,
            themeColor: THEME_COLOR,
            port: PORT
        },
        services: {
            databaseHost: DB_HOST,
            apiKeyStatus: API_KEY
        },
        systemInfo: {
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime()
        }
    });
});

app.listen(PORT, () => {
    console.log('===================================================');
    console.log(`🚀 API Server booting...`);
    console.log(`🌍 Environment Mode: ${APP_ENV}`);
    console.log(`🔌 Listening Port : ${PORT}`);
    console.log(`🎨 Active Theme   : ${THEME_COLOR}`);
    console.log(`📂 DB Host Link   : ${DB_HOST}`);
    console.log('===================================================');
});
