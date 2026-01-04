-- Simple SQL initialization script for Day 5 Postgres persistence testing

CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    favorite_docker_command VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert seed data
INSERT INTO developers (name, favorite_docker_command) 
VALUES ('Developer Aman', 'docker run -d -v pg-data:/var/lib/postgresql/data postgres');
