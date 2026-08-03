# CodeArena Google Drive Assets

## Upload Instructions

1. Create a Google Drive folder named: `CodeArena Judge Assets`
2. Upload every `*-private.zip` archive in this directory to the folder.
3. Copy the Google Drive File ID for each uploaded file (from its shareable link).
4. Fill in the `file_id` fields in `drive_mapping.json`.
5. Run the registration script from the backend root:
   ```bash
   node scripts/registerDriveAssets.js
   ```
