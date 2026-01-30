#!/bin/sh
# Day 10 PostgreSQL Connection and Seed Integrity Verifier

echo "==================================================="
echo "⚙️ PostgreSQL Connection & Seed Integrity Check"
echo "==================================================="

# Attempt to query seed tasks table inside running postgres process
if pg_isready -h localhost -p 5432 -U postgres; then
    echo "✓ Database port 5432 is responding to socket requests."
    
    # Query row counts
    count=$(psql -h localhost -p 5432 -U postgres -d postgres -t -c "SELECT COUNT(*) FROM time_entries;" | tr -d '[:space:]')
    echo "✓ Detected seeded task records in database: $count"
    
    if [ "$count" -gt 0 ]; then
        echo "🎉 DATABASE SEED INTEGRITY IS VERIFIED AND HEALTHY!"
    else
        echo "⚠️ Tasks table exists but contains no rows. Run seed script."
    fi
else
    echo "❌ PostgreSQL is offline or busy. Check logs using: docker compose logs database"
fi
echo "==================================================="
