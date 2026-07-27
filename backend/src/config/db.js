const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('FATAL: DATABASE_URL environment variable is not defined.');
    process.exit(1);
}

const poolConfig = {
    connectionString
};

// Enable SSL if not explicitly connecting to a local database, to support Cloud PostgreSQL (Neon, Railway, etc.)
if (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    poolConfig.ssl = true; 
}

const pool = new Pool(poolConfig);

module.exports = pool;
