-- Day 14 Task Manager Database Schema & Seed Data
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pre-seed diagnostic sample tasks
INSERT INTO tasks (title, description, status) VALUES
('Master Docker Networks 🌐', 'Establish custom virtual bridge subnets and verify cross-container DNS discovery protocols.', 'completed'),
('Implement Redis Cache Layer ⚡', 'Configure dynamic TTL entries to cache database reads and reduce relational load.', 'pending'),
('Orchestrate Container Self-Healing 🩺', 'Deploy declarative healthchecks with pg_isready to handle dependency startup sequences.', 'pending')
ON CONFLICT DO NOTHING;
