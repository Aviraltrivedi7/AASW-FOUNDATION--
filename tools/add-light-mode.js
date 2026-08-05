const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'aasw-pro');

// 1. Inject HTML Button
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

const toggleHTML = `<button id="themeToggle" class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all group/theme break-words" title="Toggle Light/Dark Mode"><span class="material-symbols-outlined text-xl group-hover/theme:rotate-12 transition-transform" id="themeIcon">light_mode</span></button> `;

let totalInjected = 0;
for (const file of htmlFiles) {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('id="themeToggle"')) {
        // Find the admin login button to inject before it
        const injectionTarget = '<a href="/admin/login"';
        if (content.includes(injectionTarget)) {
            content = content.replace(injectionTarget, toggleHTML + injectionTarget);
            fs.writeFileSync(filePath, content);
            totalInjected++;
            console.log(`Injected toggle in ${file}`);
        }
    }
}
console.log(`Injected theme toggle in ${totalInjected} HTML files.`);
