const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Standard Nodemailer configuration using SMTP
// If env variables are missing, it will log the OTP but won't send an email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendOTP = async (toEmail, otp) => {
    // If no email configured, just log to console for development/testing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Email skipped. OTP for ${toEmail} is: ${otp}`);
        return true;
    }

    try {
        const mailOptions = {
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: toEmail,
            subject: 'Your AASW Foundation Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1a73e8;">Welcome to AASW Foundation!</h2>
                    <p>To complete your registration, please enter the following One-Time Password (OTP) in the signup page. This code is valid for 3 minutes.</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #d93025; background: #fce8e6; padding: 20px; text-align: center; border-radius: 8px; margin: 24px 0;">
                        ${otp}
                    </div>
                    <p>If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #dadce0; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #5f6368;">AASW Foundation<br>Empowering Lives · Building Futures</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send OTP to ${toEmail}:`, error);
        return false;
    }
};

const sendContactNotification = async (name, senderEmail, subject, message) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Contact skipped. Msg from ${name}: ${message}`);
        return true;
    }

    try {
        const mailOptions = {
            from: `"AASW Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // Send to the foundation's own email
            replyTo: senderEmail,
            subject: `New Web Query: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #1a73e8; margin-top: 0;">New Contact Form Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${senderEmail}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0; white-space: pre-wrap;">${message}</div>
                    <p style="font-size: 12px; color: #777;">This message was submitted via the AASW Foundation website contact form. You can reply directly to this email to reach the sender.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Contact notification sent. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send contact notification:`, error);
        return false;
    }
};

const sendNewsletterWelcomeEmail = async (subscriberEmail) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[DEV MODE] Newsletter Welcome skipped for: ${subscriberEmail}`);
        return true;
    }

    try {
        const mailOptions = {
            from: `"AASW Foundation" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: subscriberEmail,
            subject: 'Welcome to the AASW Foundation Community!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1a73e8; padding: 20px; text-align: center;">
                        <h2 style="color: #ffffff; margin: 0;">Welcome to AASW Foundation!</h2>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; line-height: 1.5;">Hello,</p>
                        <p style="font-size: 16px; line-height: 1.5;">Thank you for subscribing to the AASW Foundation newsletter! We are thrilled to have you join our community.</p>
                        <p style="font-size: 16px; line-height: 1.5;">You will now receive our latest updates, impact stories, and program news delivered straight to your inbox. Together, we can catalyze positive change and build a more equitable India.</p>
                        <p style="font-size: 16px; line-height: 1.5;">Stay tuned for our next update!</p>
                        <br>
                        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;">Warm regards,</p>
                        <p style="font-size: 16px; font-weight: bold; margin-top: 5px;">The AASW Foundation Team</p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                        <p style="margin: 0;">AASW Foundation | Empowering Lives, Building Futures</p>
                        <p style="margin: 5px 0 0 0;">You received this email because you opted in via our website.</p>
                    </div>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Newsletter welcome sent to ${subscriberEmail}. MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send newsletter welcome to ${subscriberEmail}:`, error);
        return false;
    }
};

module.exports = { sendOTP, sendContactNotification, sendNewsletterWelcomeEmail };
