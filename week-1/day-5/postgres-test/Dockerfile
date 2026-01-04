# Day 5 Mini Project: Custom Postgres Image with Pre-seeded Schemas
FROM postgres:16-alpine

# Set database credentials and default sandbox database
ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=dockersandbox

# Copy seed SQL script into entrypoint initializer directory.
# Postgres automatically executes any .sql or .sh files found here at initial boot!
COPY init.sql /docker-entrypoint-initdb.d/
