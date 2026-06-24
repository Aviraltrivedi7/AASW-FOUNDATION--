const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// ─── ULTRA-FAST LAZY SMTP — transporter created on first use only ────────────
let _transporter = null;

function getTransporter() {
    if (_transporter) return _transporter;

    _transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: 465,
        secure: true,           // SSL direct — fastest handshake
        pool: false,            // ALWAYS fresh connections — serverless safe
        connectionTimeout: 3000, // 3s max — fail fast
        greetingTimeout: 3000,   // 3s max
        socketTimeout: 5000,     // 5s max
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
        }
    });

    return _transporter;
}

// ─── SEND MAIL — single attempt, no fallback (faster) ──────────────────────
const sendMail = async (mailOptions) => {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    return info;
};

// ─── SEND OTP ─────────────────────────────────────────────────────────────────
const sendOTP = async (toEmail, otp) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Email skipped. OTP for ${toEmail} is: ${otp}`);
        return true;
    }

    try {
        const info = await sendMail({
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
        console.log(`[Email] OTP sent to ${toEmail} | MsgId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] OTP send failed for ${toEmail}:`, error.message);
        return false;
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
