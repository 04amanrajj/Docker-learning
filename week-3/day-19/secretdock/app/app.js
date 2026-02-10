// Day 19 SecretDock Secure Secrets Auditor API
const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Helper function to read Docker secrets dynamically from memory mount
function readDockerSecret(secretName) {
    try {
        const secretPath = path.join('/run/secrets', secretName);
        if (fs.existsSync(secretPath)) {
            return fs.readFileSync(secretPath, 'utf8').trim();
        }
    } catch (err) {
        console.warn(`[Warning] Could not load secret "${secretName}":`, err.message);
    }
    return null;
}

// Load secrets safely
const dbPassword = readDockerSecret('db_password') || 'fallback_postgres';
const thirdPartyApiKey = readDockerSecret('api_key') || 'fallback_api_key';

// Initialize PG client pool using resolved file secret
const pgPool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: 5432,
    user: process.env.DB_USER || 'postgres',
    database: process.env.DB_NAME || 'secretdock',
    password: dbPassword
});

// Endpoint serving environment variable audits and resolved file secrets
app.get('/api/secrets', async (req, res) => {
    let dbStatus = "HEALTHY";
    
    // Validate database connection using password secret
    try {
        await pgPool.query('SELECT 1');
    } catch (err) {
        dbStatus = `UNHEALTHY (Resolution failed: ${err.message})`;
    }

    // Capture standard environment variables (simulating environmental dump checks)
    const envAudit = {};
    const sensitiveKeys = ['PASSWORD', 'SECRET', 'KEY', 'TOKEN', 'AUTH', 'CREDENTIALS'];
    let passwordLeakedInEnv = false;

    // Scan env for database passwords or sensitive leaks
    Object.keys(process.env).forEach(key => {
        const upperKey = key.toUpperCase();
        const isSensitive = sensitiveKeys.some(s => upperKey.includes(s));
        
        // Hide standard internal system parameters but trace values for auditor
        if (isSensitive) {
            envAudit[key] = "🚨 RED ALERT: EXPOSED IN PLAINTEXT!";
            passwordLeakedInEnv = true;
        } else {
            envAudit[key] = process.env[key];
        }
    });

    res.json({
        success: true,
        service: "secretdock-app",
        secretsAudited: {
            dbPasswordSecret: {
                mountedPath: "/run/secrets/db_password",
                status: dbPassword !== 'fallback_postgres' ? "ACTIVE (Mounted securely)" : "INACTIVE (Fallback state)",
                maskedValue: dbPassword ? `${dbPassword.slice(0, 3)}****************` : "MISSING"
            },
            apiTokenSecret: {
                mountedPath: "/run/secrets/api_key",
                status: thirdPartyApiKey !== 'fallback_api_key' ? "ACTIVE (Mounted securely)" : "INACTIVE (Fallback state)",
                maskedValue: thirdPartyApiKey ? `${thirdPartyApiKey.slice(0, 4)}****************` : "MISSING"
            }
        },
        environmentAudit: {
            totalVariables: Object.keys(process.env).length,
            leakWarning: passwordLeakedInEnv ? "🚨 DANGER: Sensitive keys found in environmental structures!" : "✓ SECURE: No sensitive secrets exposed in environmental lists.",
            exposedEnvList: envAudit
        },
        databaseState: {
            status: dbStatus,
            resolvedVia: "In-memory Docker Secret file stream redirection"
        },
        systemTime: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🔑 Secure Secrets Auditor online on port :${PORT}`);
});
