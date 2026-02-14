// PortDock Fastify Server Core - Commit 2
const Fastify = require('fastify');
const cors = require('@fastify/cors');

const fastify = Fastify({ logger: true });

// Enable Cross-Origin Resource Sharing for the React Client
fastify.register(cors, {
    origin: true // Allow all origins for production-grade dashboard proxying
});

// Standard System Healthcheck Endpoint
fastify.get('/health', async (request, reply) => {
    return { status: 'OK', uptime: process.uptime() };
});

const start = async () => {
    try {
        const PORT = process.env.PORT || 5000;
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        fastify.log.info(`✓ Fastify PortDock server listening on port :${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = { fastify };
