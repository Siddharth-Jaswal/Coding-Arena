require('dotenv').config({ path: __dirname + '/../.env' });
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('../src/config/db');
const { ZipArchive } = require('archiver');

function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function computeChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function createZipArchive(sourceDir, outPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });

        output.on('finish', () => resolve(archive.pointer()));
        output.on('close', () => resolve(archive.pointer()));
        archive.on('error', err => reject(err));

        archive.pipe(output);
        // Add all files from source directory directly to the root of the archive
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

async function runImport() {
    const startTime = Date.now();
    let stats = {
        processed: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        publicTests: 0,
        archivesGenerated: 0
    };

    const problemBankDir = path.join(__dirname, '../../problem_bank/problems');
    const exportDir = path.join(__dirname, '../exports/google_drive');
    
    // Ensure export directory exists
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    const manifest = [];
    const driveMapping = [];

    const items = fs.readdirSync(problemBankDir);

    for (const item of items) {
        const itemPath = path.join(problemBankDir, item);
        if (!fs.statSync(itemPath).isDirectory()) continue;
        
        const problemJsonPath = path.join(itemPath, 'problem.json');
        if (!fs.existsSync(problemJsonPath)) continue;

        stats.processed++;
        
        const fileContent = fs.readFileSync(problemJsonPath, 'utf8');
        let problemData;
        try {
            problemData = JSON.parse(fileContent);
        } catch (e) {
            console.error(`Failed to parse JSON for problem ${item}`);
            process.exit(1);
        }

        // Validate canonical schema
        const requiredFields = [
            'id', 'title', 'statement', 'input_format', 'output_format',
            'constraints', 'difficulty', 'tags', 'time_limit_ms', 'memory_limit_mb'
        ];
        for (const field of requiredFields) {
            if (problemData[field] === undefined) {
                console.error(`Validation failed: missing '${field}' in problem ${item}`);
                process.exit(1);
            }
        }

        const checksum = computeChecksum(fileContent);
        const slug = generateSlug(problemData.title);

        const paddedId = String(problemData.id).padStart(3, '0');
        const archiveName = `${paddedId}-private.zip`;
        const archivePath = path.join(exportDir, archiveName);

        // Check if checksum matches to skip DB import (we still need to make sure archive exists)
        const existingRes = await pool.query('SELECT checksum, version FROM problems WHERE id = $1', [problemData.id]);
        let version = 1;

        if (existingRes.rowCount > 0 && existingRes.rows[0].checksum === checksum) {
            stats.skipped++;
            version = existingRes.rows[0].version;
        } else {
            const isUpdate = existingRes.rowCount > 0;
            // Start transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // UPSERT problem
                const upsertRes = await client.query(`
                    INSERT INTO problems (
                        id, slug, title, statement, input_format, output_format,
                        constraints, difficulty, tags, time_limit_ms, memory_limit_mb,
                        checksum
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                    ) ON CONFLICT (id) DO UPDATE SET
                        slug = EXCLUDED.slug,
                        title = EXCLUDED.title,
                        statement = EXCLUDED.statement,
                        input_format = EXCLUDED.input_format,
                        output_format = EXCLUDED.output_format,
                        constraints = EXCLUDED.constraints,
                        difficulty = EXCLUDED.difficulty,
                        tags = EXCLUDED.tags,
                        time_limit_ms = EXCLUDED.time_limit_ms,
                        memory_limit_mb = EXCLUDED.memory_limit_mb,
                        checksum = EXCLUDED.checksum,
                        version = problems.version + 1
                    RETURNING version
                `, [
                    problemData.id, slug, problemData.title, problemData.statement, problemData.input_format,
                    problemData.output_format, problemData.constraints, problemData.difficulty, problemData.tags,
                    problemData.time_limit_ms, problemData.memory_limit_mb, checksum
                ]);

                version = upsertRes.rows[0].version;

                // DELETE existing public test cases for re-insertion
                await client.query("DELETE FROM test_cases WHERE problem_id = $1 AND visibility = 'PUBLIC'", [problemData.id]);

                // INSERT public test cases ONLY
                const publicDir = path.join(itemPath, 'public');
                if (fs.existsSync(publicDir)) {
                    const testParams = [];
                    const testValues = [];
                    let paramIdx = 1;
                    let order = 1;

                    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.in')).sort();
                    for (const inFile of files) {
                        const outFile = inFile.replace('.in', '.out');
                        const inPath = path.join(publicDir, inFile);
                        const outPath = path.join(publicDir, outFile);

                        if (fs.existsSync(outPath)) {
                            const inputData = fs.readFileSync(inPath, 'utf8');
                            const outputData = fs.readFileSync(outPath, 'utf8');

                            testValues.push(`($${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++}, $${paramIdx++})`);
                            testParams.push(problemData.id, order, inputData, outputData, 'PUBLIC');
                            
                            stats.publicTests++;
                            order++;
                        }
                    }

                    if (testValues.length > 0) {
                        await client.query(`
                            INSERT INTO test_cases (problem_id, case_order, input_data, output_data, visibility)
                            VALUES ${testValues.join(', ')}
                        `, testParams);
                    }
                }

                await client.query('COMMIT');

                if (isUpdate) stats.updated++;
                else stats.imported++;

            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`Error importing problem ${item}:`, err);
                process.exit(1);
            } finally {
                client.release();
            }
        }

        // Generate Zip Archive for Private Tests
        const privateDir = path.join(itemPath, 'private');
        let archiveSizeBytes = 0;
        
        if (fs.existsSync(privateDir)) {
            try {
                archiveSizeBytes = await createZipArchive(privateDir, archivePath);
                stats.archivesGenerated++;
            } catch (err) {
                console.error(`Error zipping archive for problem ${item}:`, err);
                process.exit(1);
            }
        }

        // Add to manifest and drive mapping
        manifest.push({
            problem_id: problemData.id,
            archive: archiveName,
            checksum: checksum,
            version: version,
            archive_size_bytes: archiveSizeBytes,
            file_id: null
        });

        driveMapping.push({
            problem_id: problemData.id,
            archive: archiveName,
            file_id: ""
        });
    }

    // Write metadata files
    fs.writeFileSync(path.join(exportDir, 'manifest.json'), JSON.stringify(manifest, null, 4));
    fs.writeFileSync(path.join(exportDir, 'drive_mapping.json'), JSON.stringify(driveMapping, null, 4));
    
    const readmeContent = `# CodeArena Google Drive Assets

## Upload Instructions

1. Create a Google Drive folder named: \`CodeArena Judge Assets\`
2. Upload every \`*-private.zip\` archive in this directory to the folder.
3. Copy the Google Drive File ID for each uploaded file (from its shareable link).
4. Fill in the \`file_id\` fields in \`drive_mapping.json\`.
5. Run the registration script from the backend root:
   \`\`\`bash
   node scripts/registerDriveAssets.js
   \`\`\`
`;
    fs.writeFileSync(path.join(exportDir, 'README.md'), readmeContent);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`
Problems Processed : ${stats.processed}
Imported           : ${stats.imported}
Updated            : ${stats.updated}
Skipped            : ${stats.skipped}

Public Tests       : ${stats.publicTests}
Archives Generated : ${stats.archivesGenerated}

Duration           : ${duration}s
    `.trim());

    process.exit(0);
}

runImport();
