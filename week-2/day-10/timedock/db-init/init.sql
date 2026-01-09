-- Initialize Relational Schema for Day 10 TimeDock Capstone
CREATE TABLE IF NOT EXISTS time_entries (
    id SERIAL PRIMARY KEY,
    project_name VARCHAR(100) NOT NULL,
    task_description VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INT DEFAULT 0
);

-- Seed initial mock time entry trackers
INSERT INTO time_entries (project_name, task_description, start_time, end_time, duration_seconds) VALUES
('Docker Learning', 'Study User-Defined Bridge Networks and DNS resolution', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', 3600),
('App Architecture', 'Draft three-tier microservices diagram for docker-compose', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 1800),
('Hardening Specs', 'Implement non-root USER node execution security tests', NOW() - INTERVAL '15 minutes', NULL, 0)
ON CONFLICT DO NOTHING;
