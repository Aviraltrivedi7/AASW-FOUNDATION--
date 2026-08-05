require('dotenv').config();

async function migrateAdmin() {
    const { createClient } = await import('@insforge/sdk');
    const insforgeUrl = process.env.INSFORGE_URL;
    const insforgeKey = process.env.INSFORGE_KEY;
    
    if (!insforgeUrl || !insforgeKey) {
        console.error("Missing INSFORGE_URL or INSFORGE_KEY in .env");
        return;
    }
    
    const insforge = createClient({ baseUrl: insforgeUrl, anonKey: insforgeKey });
    
    console.log("Migrating admin user to InsForge Auth...");
    const email = 'anupam@aasw.foundation';
    const password = 'AaswAdmin@2025!';
    
    const { data, error } = await insforge.auth.signUp({
        email,
        password,
        name: 'Anupam Trivedi'
    });
    
    if (error) {
        console.error("SignUp Error (maybe already exists?):", error.message);
        const { data: signInData, error: signInErr } = await insforge.auth.signInWithPassword({
            email,
            password
        });
        if (signInErr) {
            console.error("SignIn Error:", signInErr.message);
        } else {
            console.log("Admin can successfully log in with password:", password);
        }
    } else {
        console.log("Successfully created admin in InsForge Auth.");
        console.log("Admin credentials -> Email:", email, "| Password:", password);
        if (data.requireEmailVerification) {
            console.log("WARNING: Email verification is required in InsForge. Please verify the email, or disable email verification in InsForge Dashboard.");
        }
    }
}

migrateAdmin().catch(console.error);
