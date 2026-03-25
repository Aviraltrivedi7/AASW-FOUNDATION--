const fs = require("fs");
const path = require("path");
const { catchAsync } = require("../utils/catchAsync");
const { ApiResponse } = require("../utils/apiResponse");
const { sendContactNotification } = require("../utils/email");

const CONTACTS_FILE = path.join(__dirname, "..", "..", "contacts.json");

// Read existing contacts
function readContacts() {
    try {
        if (fs.existsSync(CONTACTS_FILE)) {
            return JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf-8"));
        }
    } catch (err) {
        console.error("[Contact] Error reading contacts file:", err.message);
    }
    return { contacts: [] };
}

// Write contacts to file
function writeContacts(data) {
    fs.writeFileSync(CONTACTS_FILE, JSON.stringify(data, null, 2), "utf-8");
}

const submitContact = catchAsync(async (req, res) => {
    const { name, email, subject, message, website } = req.body;

    // Honeypot check — bots fill the hidden "website" field, humans don't
    if (website && website.trim().length > 0) {
        // Silently reject spam — return fake success so bots don't retry
        return res.status(200).json(
            new ApiResponse(200, {}, "Your message has been received.")
        );
    }

    const data = readContacts();
    data.contacts.push({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        submittedAt: new Date().toISOString(),
        ip: req.ip || "unknown"
    });
    // Delay file write by 500ms to allow the HTTP response to complete before nodemon restarts the server
    setTimeout(() => {
        writeContacts(data);
    }, 500);

    return res.status(201).json(
        new ApiResponse(
            201,
            { name, email },
            "Your message has been received successfully. We will get back to you soon."
        )
    );
});

module.exports = { submitContact };
