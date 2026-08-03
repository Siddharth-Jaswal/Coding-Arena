require('dotenv').config({ path: __dirname + '/../.env' });
const GoogleDriveProvider = require('../src/storage/GoogleDriveProvider');
const fs = require('fs');

async function runVerification() {
    console.log("=== Verifying Google Drive Cache Workflow ===");
    
    // Pick two problems to test
    const problems = [1, 20];
    
    for (const pid of problems) {
        console.log(`\nTesting Problem ${pid}:`);
        
        // 1. Initial Cache Check
        let isValid = await GoogleDriveProvider.verifyCache(pid);
        console.log(`Initial cache valid? ${isValid}`);
        
        // 2. Download and Extract
        if (!isValid) {
            console.log(`Downloading archive from Google Drive...`);
            const cachePath = await GoogleDriveProvider.downloadArchive(pid);
            console.log(`Extracted to: ${cachePath}`);
            
            // Check contents
            const files = fs.readdirSync(cachePath);
            console.log(`Files found in cache: ${files.length}`);
            
            // 3. Re-verify Cache
            isValid = await GoogleDriveProvider.verifyCache(pid);
            console.log(`Cache valid after download? ${isValid}`);
            
            if (!isValid) {
                console.error(`❌ Verification failed for Problem ${pid}`);
                process.exit(1);
            }
        }
        
        // 4. Test Invalidation
        console.log("Testing cache invalidation...");
        const metaPath = `${GoogleDriveProvider.cacheDir}/${String(pid).padStart(3, '0')}/.meta.json`;
        if (fs.existsSync(metaPath)) {
            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            meta.version = -1; // Tamper version
            fs.writeFileSync(metaPath, JSON.stringify(meta));
            
            isValid = await GoogleDriveProvider.verifyCache(pid);
            console.log(`Cache valid after tampering? ${isValid}`);
            
            if (isValid) {
                console.error(`❌ Tampered cache was considered valid for Problem ${pid}`);
                process.exit(1);
            }
        }
    }
    
    console.log("\n🎉 Cache Verification Complete! Everything works.");
    process.exit(0);
}

runVerification().catch(console.error);
