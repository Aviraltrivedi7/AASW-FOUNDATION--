/**
 * Google Drive Upload Service Layer
 *
 * Folder Target: 1wURe11fbvl2uI_EF7tfJVHxPALEYyJKA
 *
 * Strategy:
 *   1. Accepts Base64 data URL from ID Proof uploads (Aadhaar/PAN card images or PDFs).
 *   2. If GOOGLE_DRIVE_WEBHOOK_URL is configured (Google Apps Script Web App attached to folder),
 *      uploads file directly to Google Drive folder 1wURe11fbvl2uI_EF7tfJVHxPALEYyJKA.
 *   3. Returns direct Google Drive view URL (e.g. https://drive.google.com/file/d/XYZ/view).
 *   4. If Google Drive upload fails or URL is missing, falls back gracefully to original string.
 */

const DEFAULT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1wURe11fbvl2uI_EF7tfJVHxPALEYyJKA';

/**
 * Upload Base64 ID document to Google Drive folder
 * @param {string} base64DataDataUrl - Raw or DataURL base64 string
 * @param {string} fileTitle - Desired filename
 * @param {string} memberName - Member name for record reference
 * @returns {Promise<string>} Google Drive view link or fallback string
 */
async function uploadIdToGoogleDrive(base64DataDataUrl, fileTitle = 'ID_Proof', memberName = '') {
    if (!base64DataDataUrl || typeof base64DataDataUrl !== 'string') {
        return base64DataDataUrl || '';
    }

    const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    if (!webhookUrl) {
        console.log('[GoogleDrive] GOOGLE_DRIVE_WEBHOOK_URL not set in env. Using data URL fallback.');
        return base64DataDataUrl;
    }

    try {
        // Extract content type and raw base64 data
        let contentType = 'image/jpeg';
        let rawBase64 = base64DataDataUrl;

        if (base64DataDataUrl.startsWith('data:')) {
            const parts = base64DataDataUrl.split(';base64,');
            contentType = parts[0].replace('data:', '');
            rawBase64 = parts[1] || '';
        }

        // Determine file extension
        let ext = 'jpg';
        if (contentType.includes('pdf')) ext = 'pdf';
        else if (contentType.includes('png')) ext = 'png';
        else if (contentType.includes('webp')) ext = 'webp';

        const safeMemberName = (memberName || 'Member').replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `${safeMemberName}_${fileTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${ext}`;

        const payload = {
          folderId: DEFAULT_FOLDER_ID,
          fileName,
          contentType,
          base64Data: rawBase64
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.warn(`[GoogleDrive] Upload HTTP error ${response.status}: ${response.statusText}`);
            return base64DataDataUrl;
        }

        const resData = await response.json().catch(() => ({}));
        if (resData && (resData.fileUrl || resData.url || resData.link)) {
            const driveUrl = resData.fileUrl || resData.url || resData.link;
            console.log(`[GoogleDrive] Successfully uploaded ${fileName} to folder ${DEFAULT_FOLDER_ID}: ${driveUrl}`);
            return driveUrl;
        }

        if (resData && resData.fileId) {
            const driveUrl = `https://drive.google.com/file/d/${resData.fileId}/view`;
            console.log(`[GoogleDrive] Successfully uploaded ${fileName} to folder ${DEFAULT_FOLDER_ID}: ${driveUrl}`);
            return driveUrl;
        }

        console.warn('[GoogleDrive] Unexpected response format from Apps Script webhook:', resData);
        return base64DataDataUrl;
    } catch (err) {
        console.error('[GoogleDrive] Failed to upload to Google Drive:', err.message);
        return base64DataDataUrl; // Return fallback base64 string
    }
}

module.exports = {
    uploadIdToGoogleDrive,
    DEFAULT_FOLDER_ID
};
