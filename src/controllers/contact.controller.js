const { catchAsync } = require("../utils/catchAsync");
const { ApiResponse } = require("../utils/apiResponse");
const { sendContactNotification } = require("../utils/email");
const { insforge } = require("../config/insforge");

const submitContact = catchAsync(async (req, res) => {
    const { name, email, subject, message, website } = req.body;

    // Honeypot check — bots fill the hidden "website" field, humans don't
    if (website && website.trim().length > 0) {
        // Silently reject spam — return fake success so bots don't retry
        return res.status(200).json(
            new ApiResponse(200, {}, "Your message has been received.")
        );
    }

    // Insert into InsForge
    if (insforge) {
        const { error } = await insforge.database.from('contacts').insert([{
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
        }]);
        if (error) {
            console.error("[Contact] Database Insert Error:", error);
        }
    }

    // Send email notification in background (fire-and-forget)
    sendContactNotification(name, email, subject, message).catch(err => {
        console.error('[Contact] Failed to send notification email:', err.message);
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            { name, email },
            'Your message has been received successfully. We will get back to you soon.'
        )
    );
});

module.exports = { submitContact };
