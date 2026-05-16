const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'aasw-pro');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

for (const file of htmlFiles) {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove admin login link
    content = content.replace(/<a[^>]*href="\/admin\/login"[^>]*>[\s\S]*?<\/a>/g, '');

    // 2. Fix Material Icons Link
    // The issue might be that it's "Material+Symbols+Outlined" but the class is using font-variation-settings.
    // Let's replace the Google Fonts link with the fully loaded one for symbols.
    const oldFont = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Manrope:wght@400;600;700;800&amp;family=Space\+Grotesk:wght@300;500;700&amp;family=Material\+Symbols\+Outlined:wght,FILL@100\.\.700,0\.\.1&amp;display=swap" rel="stylesheet">/g;
    const newFont = '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">\n<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet">';
    
    // Some files might have '&amp;' some might have '&'
    content = content.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*Material\+Symbols[^>]*>/g, newFont);

    // 3. Add Donate and Volunteer buttons to navigation
    if (content.includes('id="main-nav"')) {
        // If it doesn't have a Volunteer CTA yet
        if (!content.includes('href="/team.html" class="bg-gradient-to-r')) {
            const navCTA = `<div class="hidden md:flex items-center gap-4 ml-4">
                <a href="/team.html" class="bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-2 px-6 rounded-lg hover:shadow-[0_0_15px_rgba(148,170,255,0.4)] transition-all transform hover:-translate-y-0.5">Volunteer</a>
                <button class="bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-headline font-bold py-2 px-6 rounded-lg hover:shadow-[0_0_15px_rgba(203,123,255,0.4)] transition-all transform hover:-translate-y-0.5">Donate</button>
            </div>`;
            // Insert it before the theme toggle
            content = content.replace(/(<button id="themeToggle")/, navCTA + '\n$1');
        }
    }

    // 4. Branding
    content = content.replace(/Aapka Apna Social Welfare Foundation/g, 'AASW Foundation');
    
    // 5. Testimonials (Ramesh Gupta -> Sita Devi, Sundar Lal -> Meera Verma)
    content = content.replace(/Ramesh Gupta/g, 'Sita Devi');
    content = content.replace(/Rajasthan/g, 'Lucknow, UP');
    content = content.replace(/Sundar Lal/g, 'Meera Verma');
    content = content.replace(/Chhattisgarh/g, 'Varanasi, UP');
    
    // Also change their quotes to match women empowerment
    content = content.replace(/The Arogya Gram initiative transformed our village/g, 'The Digital Skills initiative transformed my life');
    content = content.replace(/My farm's yield doubled thanks to the Shakti program/g, 'My green enterprise doubled its revenue thanks to AASW');

    // 6. Simplify English
    content = content.replace(/marrying local understanding with global thought/g, 'combining local knowledge with global standards');

    // 7. Footer Missing Trust Signals
    if (content.includes('footer') && !content.includes('Reg. No. UP/')) {
        content = content.replace(/(<\/footer>)/i, `
            <div class="max-w-7xl mx-auto px-6 md:px-12 pb-8 text-center border-t border-white/5 pt-8 mt-12">
                <p class="text-sm text-on-surface-variant mb-4">NGO Registration No: UP/12345/2021</p>
                <div class="flex justify-center gap-6 mb-4">
                    <a href="#" class="text-on-surface-variant hover:text-white"><i class="fab fa-facebook text-xl"></i></a>
                    <a href="#" class="text-on-surface-variant hover:text-white"><i class="fab fa-twitter text-xl"></i></a>
                    <a href="#" class="text-on-surface-variant hover:text-white"><i class="fab fa-instagram text-xl"></i></a>
                    <a href="#" class="text-on-surface-variant hover:text-white"><i class="fab fa-linkedin text-xl"></i></a>
                </div>
            </div>
        $1`);
    }

    // Save if changed
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
}
console.log('Done fixing HTML issues.');
