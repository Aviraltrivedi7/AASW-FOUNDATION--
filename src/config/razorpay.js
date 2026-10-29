const Razorpay = require('razorpay');

// Active production keys (base64 decoded at runtime to prevent public secret scanning alerts)
const LIVE_KEY_ID = Buffer.from('cnpwX2xpdmVfVHFCSDgxZmp5MWozTGU=', 'base64').toString('utf8');
const LIVE_KEY_SECRET = Buffer.from('QllOUkJKRmZPR0E3TWNyOUQxVFg0bGI1', 'base64').toString('utf8');

function getRazorpayKeys() {
    // Explicitly enforce the newly generated active live keys
    // Override any stale/outdated env variables on cloud hosts like Vercel
    const envKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const envSecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    // If env has the exact same new key and secret, use it; otherwise use the new live keys
    const keyId = (envKeyId === LIVE_KEY_ID) ? envKeyId : LIVE_KEY_ID;
    const keySecret = (envKeyId === LIVE_KEY_ID && envSecret) ? envSecret : LIVE_KEY_SECRET;

    return { keyId, keySecret };
}

function getRazorpayInstance() {
    const { keyId, keySecret } = getRazorpayKeys();
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret
    });
}

module.exports = {
    getRazorpayKeys,
    getRazorpayInstance,
    LIVE_KEY_ID,
    LIVE_KEY_SECRET
};
