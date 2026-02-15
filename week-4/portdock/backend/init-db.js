// PortDock Database Schema Initializer - Commit 4
const { pgPool } = require('./database');

async function initializeDatabase() {
    try {
        console.log('🐘 Starting PostgreSQL database migration schemas...');
        
        // Create tasks table
        await pgPool.query(`
            CREATE TABLE IF NOT EXISTS portfolio_tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Seed initial data if empty
        const countRes = await pgPool.query('SELECT COUNT(*) FROM portfolio_tasks');
        if (parseInt(countRes.rows[0].count) === 0) {
            await pgPool.query(`
                INSERT INTO portfolio_tasks (title, description, completed) VALUES
                ('Deploy Multi-stage App', 'Optimize Alpine Docker containers for production environments', true),
                ('Configure Prometheus Scrapers', 'Set up time-series collection intervals and cAdvisor metrics', false),
                ('Implement TLS Reverse Proxy', 'Route public port 443 handshakes through secure Nginx gateways', false)
            `);
            console.log('✓ Seeding complete: loaded standard tasks.');
        }

        console.log('✓ Relational schema migrations successfully completed.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        throw err;
    }
}

module.exports = { initializeDatabase };
