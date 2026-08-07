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
        connectionTimeout: 3000, // 3s max (fast fallback)
        greetingTimeout: 3000,   // 3s max
        socketTimeout: 5000,    // 5s max
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

    const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'aaswfoundation06@gmail.com';

    try {
        // 1. Send notification email to NGO Admin
        const adminMailOptions = {
            from: `"AASW Website Contact" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: adminEmail,
            replyTo: senderEmail,
            subject: `New Web Query: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1a73e8, #6c169f); padding: 15px 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 20px;">AASW Foundation — New Contact Query</h2>
                    </div>
                    <p style="font-size: 15px;">You have received a new message from the website <strong>Get In Touch</strong> form:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
                        <tr><td style="padding: 8px; font-weight: bold; width: 120px; color: #555;">Name:</td><td style="padding: 8px; color: #111;">${safeName}</td></tr>
                        <tr style="background: #f9f9f9;"><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px; color: #111;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
                        <tr><td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px; color: #111;">${safeSubject}</td></tr>
                    </table>
                    <div style="background: #f4f6f9; padding: 18px; border-left: 4px solid #1a73e8; margin: 20px 0; border-radius: 4px; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</div>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
                    <p style="font-size: 12px; color: #777; margin: 0;">Tip: You can click <strong>Reply</strong> in your email client to respond directly to ${safeName} (${safeEmail}).</p>
                </div>
            `,
        };

        const info = await sendMail(adminMailOptions);
        console.log(`[Email] Contact notification sent to admin (${adminEmail}). MessageId: ${info.messageId}`);

        // 2. Send confirmation auto-reply email to user
        const userMailOptions = {
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: senderEmail,
            subject: `We received your message — AASW Foundation`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #1a73e8; margin: 0;">AASW Foundation</h2>
                        <p style="color: #666; font-size: 13px; margin-top: 4px;">Empowering Lives · Building Futures</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;" />
                    <h3 style="color: #222;">Hello ${safeName},</h3>
                    <p style="font-size: 14px; line-height: 1.6; color: #444;">
                        Thank you for reaching out to <strong>AASW Foundation</strong>. We have successfully received your inquiry regarding <strong>"${safeSubject}"</strong>.
                    </p>
                    <p style="font-size: 14px; line-height: 1.6; color: #444;">
                        Our team is reviewing your message and will respond to you shortly.
                    </p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #94aaff; margin: 20px 0; border-radius: 4px; font-size: 13px; color: #555;">
                        <strong>Copy of your message:</strong><br>
                        <em>"${safeMessage}"</em>
                    </div>
                    <p style="font-size: 14px; margin-top: 25px; margin-bottom: 5px;">Warm Regards,</p>
                    <p style="font-weight: bold; color: #1a73e8; margin: 0;">The AASW Foundation Team</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
                    <p style="font-size: 11px; text-align: center; color: #888; margin: 0;">
                        Kanpur Dehat, Uttar Pradesh, India | contact@aaswfoundation.com | +91 9984156418
                    </p>
                </div>
            `
        };

        sendMail(userMailOptions).catch(err => {
            console.warn(`[Email Warning] User confirmation email to ${senderEmail} failed:`, err.message);
        });

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
            subject: `Welcome to AASW Foundation! Your Membership Certificate is inside`,
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

const sendDonationSuccessEmail = async (toEmail, donorName, amount, txnId, pan, initiative) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Donation success email skipped for ${toEmail}. Donor: ${donorName}, Amount: ₹${amount}`);
        return true;
    }

    try {
        const panSection = pan ? `<p style="margin: 5px 0;"><strong>PAN Card Number:</strong> ${pan} (Provided for 80G tax benefit claim)</p>` : '';
        const mailOptions = {
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `Thank you for your donation of ₹${amount} to AASW Foundation!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 25px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #1a73e8; margin-bottom: 5px;">Aapka Apna Social Welfare (AASW) Foundation</h2>
                        <p style="color: #666; font-size: 14px; margin-top: 0;">Empowering Communities. Building Futures.</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin-bottom: 20px;">
                    <h3 style="color: #333;">Dear ${donorName},</h3>
                    <p>On behalf of the AASW Foundation, we would like to express our heartfelt gratitude for your generous donation of <strong>₹${amount}</strong> to support <strong>${initiative}</strong>.</p>
                    <p>Your support is vital to our mission of bridging the digital divide, empowering women leaders, and building self-reliant communities.</p>
                    
                    <div style="background: #f8f9fa; border-left: 4px solid #1a73e8; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h4 style="margin-top: 0; color: #1a73e8; margin-bottom: 10px;">Transaction Details</h4>
                        <p style="margin: 5px 0;"><strong>Donor Name:</strong> ${donorName}</p>
                        <p style="margin: 5px 0;"><strong>Donation Amount:</strong> ₹${amount}</p>
                        <p style="margin: 5px 0;"><strong>Cause Supported:</strong> ${initiative}</p>
                        <p style="margin: 5px 0;"><strong>Transaction/Payment ID:</strong> ${txnId}</p>
                        ${panSection}
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    </div>

                    <p style="font-size: 13px; color: #666; line-height: 1.5;">
                        <strong>Tax Exemption Notice:</strong> AASW Foundation is registered under Section 80G of the Income Tax Act. Your donation is eligible for tax exemption. Please retain this email and transaction ID as proof of your contribution. An official receipt/certificate will be sent to you in due course.
                    </p>

                    <p style="margin-top: 30px; margin-bottom: 0;">Warm Regards,</p>
                    <p style="font-weight: bold; margin-top: 5px; color: #1a73e8;">The AASW Foundation Team</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;">
                    <p style="font-size: 11px; text-align: center; color: #999; margin: 0;">
                        NGO Registration No: UP/2025/AASW | NITI Aayog Registered<br>
                        Kanpur Dehat, Uttar Pradesh, India | contact@aaswfoundation.com
                    </p>
                </div>
            `
        };

        const info = await sendMail(mailOptions);
        console.log(`[Email] Donation success email sent to ${toEmail} | MsgId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send donation success email:`, error.message);
        throw error;
    }
};

const sendAdminMembershipNotification = async (memberData) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Admin membership alert skipped for ${memberData.email || 'member'}`);
        return true;
    }

    const adminEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || 'aaswfoundation06@gmail.com';
    const { name, email, phone, pan, address, planName, amount, payment_id, idDocument, idDocumentType } = memberData;

    try {
        const mailOptions = {
            from: `"AASW Membership Alert" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `NEW MEMBER JOINED: ${name || 'Member'} (${planName || 'Membership'})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #1a73e8, #10b981); padding: 18px 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
                        <h2 style="margin: 0; font-size: 22px;">New Member Registration Alert!</h2>
                        <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Someone just completed their membership payment on AASW Foundation!</p>
                    </div>

                    <h3 style="color: #1a73e8; margin-top: 0;">Member Details</h3>
                    <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 14px;">
                        <tr><td style="padding: 10px; font-weight: bold; width: 140px; color: #555; border-bottom: 1px solid #eee;">Full Name:</td><td style="padding: 10px; color: #111; font-weight: bold; border-bottom: 1px solid #eee;">${name || 'Member'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Email Address:</td><td style="padding: 10px; color: #111; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Phone Number:</td><td style="padding: 10px; color: #111; border-bottom: 1px solid #eee;">${phone || 'N/A'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Membership Tier:</td><td style="padding: 10px; color: #1a73e8; font-weight: bold; border-bottom: 1px solid #eee;">${planName || 'Annual Subscription'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Amount Paid:</td><td style="padding: 10px; color: #10b981; font-weight: bold; border-bottom: 1px solid #eee;">₹${amount || 1100}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Razorpay Txn ID:</td><td style="padding: 10px; color: #111; font-family: monospace; border-bottom: 1px solid #eee;">${payment_id || 'N/A'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">PAN Card:</td><td style="padding: 10px; color: #111; border-bottom: 1px solid #eee;">${pan || 'N/A'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">Residential Address:</td><td style="padding: 10px; color: #111; border-bottom: 1px solid #eee;">${address || 'N/A'}</td></tr>
                        <tr><td style="padding: 10px; font-weight: bold; color: #555; border-bottom: 1px solid #eee;">ID Proof Type:</td><td style="padding: 10px; color: #111; border-bottom: 1px solid #eee;">${idDocumentType || 'Aadhaar Card'}</td></tr>
                    </table>

                    ${(idDocument && idDocument.startsWith('http')) ? `
                    <div style="background: #f0f7ff; border: 1px dashed #1a73e8; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #555;">Uploaded ID Proof Document (Google Drive):</p>
                        <a href="${idDocument}" target="_blank" style="display: inline-block; background: #1a73e8; color: white; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">View ID Proof Document</a>
                    </div>
                    ` : ''}

                    <p style="font-size: 13px; color: #666; margin-top: 20px;">
                        This member's details have been automatically verified and saved to the InsForge database & MongoDB, and their membership certificate has been emailed to them.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0 15px 0;" />
                    <p style="font-size: 11px; text-align: center; color: #888; margin: 0;">
                        AASW Foundation Admin Automation System
                    </p>
                </div>
            `
        };

        const info = await sendMail(mailOptions);
        console.log(`[Email] Admin Membership Alert sent to ${adminEmail} | MsgId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send admin membership notification:`, error.message);
        return false;
    }
};

module.exports = { sendOTP, sendContactNotification, sendMembershipSuccessEmail, sendDonationSuccessEmail, sendAdminMembershipNotification };

// Trigger new deployment for env vars.


