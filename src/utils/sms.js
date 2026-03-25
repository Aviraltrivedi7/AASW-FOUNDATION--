const https = require('https');

/**
 * Send OTP via Fast2SMS API
 * Docs: https://docs.fast2sms.com
 */
const sendMobileOTP = async (mobileNumber, otp) => {
    if (!process.env.FAST2SMS_API_KEY) {
        console.log(`[DEV MODE - SMS] OTP for ${mobileNumber}: ${otp}`);
        return { success: true, dev: true };
    }

    return new Promise((resolve, reject) => {
        const message = `Your AASW Foundation membership OTP is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;

        const postData = JSON.stringify({
            route: 'q',   // Quick SMS (transactional)
            message: message,
            language: 'english',
            flash: 0,
            numbers: mobileNumber
        });

        const options = {
            hostname: 'www.fast2sms.com',
            path: '/dev/bulkV2',
            method: 'POST',
            headers: {
                'authorization': process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.return === true) {
                        console.log(`[SMS] OTP sent to ${mobileNumber}`);
                        resolve({ success: true });
                    } else {
                        console.error(`[SMS Error] Fast2SMS response:`, parsed);
                        resolve({ success: false, error: parsed.message || 'SMS send failed' });
                    }
                } catch (e) {
                    resolve({ success: false, error: 'Invalid SMS API response' });
                }
            });
        });

        req.on('error', (err) => {
            console.error('[SMS Error]', err.message);
            resolve({ success: false, error: err.message });
        });

        req.write(postData);
        req.end();
    });
};

module.exports = { sendMobileOTP };
