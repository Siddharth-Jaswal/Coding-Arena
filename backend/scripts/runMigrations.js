require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function runMigrations() {
    const migrationsDir = path.join(__dirname, '../src/db/migrations');
    
    // Create migrations table if it doesn't exist
    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT NOW()
        )
    `);

    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
        if (!file.endsWith('.sql')) continue;
        
        const { rowCount } = await pool.query(
            'SELECT * FROM schema_migrations WHERE version = $1',
            [file]
        );
        
        if (rowCount === 0) {
            console.log(`Running migration: ${file}`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            try {
                await pool.query('BEGIN');
                await pool.query(sql);
                await pool.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
                await pool.query('COMMIT');
                console.log(`Successfully applied: ${file}`);
            } catch (err) {
                await pool.query('ROLLBACK');
                console.error(`Error applying migration ${file}:`, err);
                process.exit(1);
            }
        } else {
            console.log(`Skipping already applied migration: ${file}`);
        }
    }
    
    console.log("All migrations applied successfully!");
    process.exit(0);
}

runMigrations();
