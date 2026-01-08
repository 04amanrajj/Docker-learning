-- Initialize Task Table for Day 9 Capstone PostgreSQL Database
CREATE TABLE IF NOT EXISTS compose_tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pre-populate default database records
INSERT INTO compose_tasks (title, status) VALUES
('Initialize declarative docker-compose orchestration schema', 'done'),
('Establish PostgreSQL persistent named database volume mounts', 'in-progress'),
('Inject dynamic environmental credentials for multi-node security', 'todo')
ON CONFLICT DO NOTHING;
