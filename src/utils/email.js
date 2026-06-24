const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter helper for specific port
function createTransporter(port, secure) {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: secure,
        pool: false,            // fresh connection per mail for serverless
        connectionTimeout: 8000, // 8s max
        greetingTimeout: 8000,   // 8s max
        socketTimeout: 10000,    // 10s max
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    });
}

// ─── SEND MAIL WITH FALLBACK ──────────────────────────────────────────────────
const sendMail = async (mailOptions) => {
    // 1. Try port 465 (SSL) first
    try {
        console.log(`[Email] Attempting delivery on port 465 (SSL)...`);
        const transporter465 = createTransporter(465, true);
        const info = await transporter465.sendMail(mailOptions);
        console.log(`[Email] Port 465 succeeded! MsgId: ${info.messageId}`);
        return info;
    } catch (err465) {
        console.warn(`[Email Warning] Port 465 failed: ${err465.message}. Retrying via port 587 (STARTTLS)...`);
        // 2. Fallback to port 587
        try {
            const transporter587 = createTransporter(587, false);
            const info = await transporter587.sendMail(mailOptions);
            console.log(`[Email] Port 587 fallback succeeded! MsgId: ${info.messageId}`);
            return info;
        } catch (err587) {
            console.error(`[Email Error] Both SMTP ports failed. Port 465: ${err465.message} | Port 587: ${err587.message}`);
            throw new Error(`SMTP failed on both ports. Port 465: ${err465.message} | Port 587: ${err587.message}`);
        }
    }
};

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
const sendOTP = async (toEmail, otp) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Email skipped. OTP for ${toEmail} is: ${otp}`);
        return true;
    }

    try {
        await sendMail({
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `AASW Foundation — Your Verification Code`,
            text: `Your AASW Foundation verification code is: ${otp}\n\nValid for 5 minutes. Do not share this code with anyone.`,
            html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto">
<h2 style="color:#1a73e8;margin-bottom:4px">AASW Foundation</h2>
<p style="color:#555;margin-top:0">Your Verification Code</p>
<div style="font-size:36px;font-weight:700;letter-spacing:6px;color:#d93025;background:#fce8e6;padding:20px;text-align:center;border-radius:8px;margin:20px 0">${otp}</div>
<p style="color:#555;font-size:14px">Valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
<hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
<p style="color:#999;font-size:11px">AASW Foundation · Empowering Lives · Building Futures<br>If you did not request this, ignore this email.</p>
</div>`,
            priority: 'high',
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        });
        return true;
    } catch (error) {
        console.error(`[Email Error] OTP send failed for ${toEmail}:`, error.message);
        throw error; // Re-throw so controller catches it and prints details
    }
};

const sendContactNotification = async (name, senderEmail, subject, message) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Contact skipped. Msg from ${name}: ${message}`);
        return true;
    }

    const escapeHtml = (str) => String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(senderEmail);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    try {
        const mailOptions = {
            from: `"AASW Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            replyTo: senderEmail,
            subject: `New Web Query: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #1a73e8; margin-top: 0;">New Contact Form Message</h2>
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0; white-space: pre-wrap;">${safeMessage}</div>
                    <p style="font-size: 12px; color: #777;">This message was submitted via the AASW Foundation website contact form. You can reply directly to this email to reach the sender.</p>
                </div>
            `,
        };

        const info = await sendMail(mailOptions);
        console.log(`[Email] Contact notification sent. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send contact notification:`, error.message);
        return false;
    }
};

const sendMembershipSuccessEmail = async (toEmail, memberName, pdfBuffer) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Membership success email skipped for ${toEmail}. Cert generated but not emailed.`);
        return true;
    }

    try {
        const mailOptions = {
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `Welcome to AASW Foundation! Your Membership Certificate is inside 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1a73e8;">Hello ${memberName},</h2>
                    <p>Thank you for becoming a valued member of the <strong>Aapka Apna Social Welfare (AASW) Foundation</strong>!</p>
                    <p>Your commitment helps us bridge the digital divide and build a new wave of confident, capable leaders across communities.</p>
                    <p>Please find your official <strong>Membership Certificate</strong> attached to this email as a PDF.</p>
                    <br>
                    <p>Warm Regards,</p>
                    <p><strong>The AASW Foundation Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: 'AASW-Membership-Certificate.pdf',
                    content: Buffer.from(pdfBuffer),
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await sendMail(mailOptions);
        console.log(`[Email] Membership Success/Cert sent to ${toEmail} | MsgId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send membership success email:`, error.message);
        return false;
    }
};

module.exports = { sendOTP, sendContactNotification, sendMembershipSuccessEmail };
// Trigger new deployment for env vars.

