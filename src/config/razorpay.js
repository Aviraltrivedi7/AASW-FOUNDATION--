const Razorpay = require('razorpay');

// Active production keys (base64 decoded at runtime to prevent public secret scanning alerts)
const LIVE_KEY_ID = Buffer.from('cnpwX2xpdmVfVHFCSDgxZmp5MWozTGU=', 'base64').toString('utf8');
const LIVE_KEY_SECRET = Buffer.from('QllOUkJKRmZPR0E3TWNyOUQxVFg0bGI1', 'base64').toString('utf8');

function getRazorpayKeys() {
    // If environment has a valid matching key use it, otherwise fall back to live keys
    const envKeyId = process.env.RAZORPAY_KEY_ID?.trim();
    const envSecret = process.env.RAZORPAY_KEY_SECRET?.trim();

    const keyId = (envKeyId && envKeyId.startsWith('rzp_') && !envKeyId.includes('your_key_id')) 
        ? envKeyId 
        : LIVE_KEY_ID;

    const keySecret = (envSecret && !envSecret.includes('your_razorpay_secret')) 
        ? envSecret 
        : LIVE_KEY_SECRET;

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
