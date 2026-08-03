require('dotenv').config({ path: __dirname + '/../.env' });
const pool = require('../src/config/db');

async function removePrivateTestCases() {
    console.log('Connecting to database...');
    try {
        const result = await pool.query("DELETE FROM test_cases WHERE visibility = 'PRIVATE'");
        console.log(`Successfully deleted ${result.rowCount} private test cases from PostgreSQL.`);
    } catch (err) {
        console.error('Error deleting private test cases:', err);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

removePrivateTestCases();
