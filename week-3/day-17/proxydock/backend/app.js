// Day 17 ProxyDock Reverse Proxy Verification API
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Telemetry check serving client diagnostic headers
app.get('/api/telemetry', (req, res) => {
    res.json({
        success: true,
        message: "⚡ Telemetry successfully routed through Nginx proxy!",
        clientMetadata: {
            remoteAddress: req.socket.remoteAddress,
            xRealIP: req.header('x-real-ip') || 'Direct Connection (No proxy header)',
            xForwardedFor: req.header('x-forwarded-for') || 'Direct Connection (No proxy header)',
            hostHeader: req.header('host')
        },
        systemTime: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`📡 Telemetry Backend online on internal port :${PORT}`);
});
