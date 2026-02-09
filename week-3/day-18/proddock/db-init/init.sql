CREATE TABLE IF NOT EXISTS system_audits (
    id SERIAL PRIMARY KEY,
    component VARCHAR(50) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_audits (component, check_type, status) VALUES
('database', 'healthcheck', 'HEALTHY'),
('app-node', 'security_context', 'UNPRIVILEGED'),
('cache-redis', 'capability_shedding', 'HARDENED');
