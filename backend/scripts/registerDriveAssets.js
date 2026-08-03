require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function registerAssets() {
    const mappingPath = path.join(__dirname, '../exports/google_drive/drive_mapping.json');
    const manifestPath = path.join(__dirname, '../exports/google_drive/manifest.json');

    if (!fs.existsSync(mappingPath)) {
        console.error('drive_mapping.json not found. Run importProblemBank.js first.');
        process.exit(1);
    }
    if (!fs.existsSync(manifestPath)) {
        console.error('manifest.json not found.');
        process.exit(1);
    }

    const mappings = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    const manifestMap = new Map(manifest.map(m => [m.problem_id, m]));

    console.log(`Found ${mappings.length} mappings to process.`);

    for (const mapping of mappings) {
        if (!mapping.file_id || mapping.file_id.trim() === '') {
            console.log(`Skipping problem ${mapping.problem_id}: no file_id provided.`);
            continue;
        }

        const mData = manifestMap.get(mapping.problem_id);
        if (!mData) {
            console.error(`Error: problem ${mapping.problem_id} found in mapping but not in manifest.`);
            continue;
        }

        try {
            await pool.query(`
                INSERT INTO problem_assets (
                    problem_id, provider, file_id, checksum, version, archive_size_bytes
                ) VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (problem_id) DO UPDATE SET
                    provider = EXCLUDED.provider,
                    file_id = EXCLUDED.file_id,
                    checksum = EXCLUDED.checksum,
                    version = EXCLUDED.version,
                    archive_size_bytes = EXCLUDED.archive_size_bytes
            `, [
                mapping.problem_id,
                'GOOGLE_DRIVE',
                mapping.file_id.trim(),
                mData.checksum,
                mData.version,
                mData.archive_size_bytes
            ]);
            console.log(`Registered Google Drive asset for problem ${mapping.problem_id} (File ID: ${mapping.file_id.trim()})`);
        } catch (err) {
            console.error(`Error registering asset for problem ${mapping.problem_id}:`, err.message);
        }
    }

    console.log("Registration complete.");
    process.exit(0);
}

registerAssets();
