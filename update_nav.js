const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'aasw-pro');
const files = fs.readdirSync(dir);

let replaceCount = 0;

const desktopNavRegex = /<li[^>]*>\s*<a[^>]*href="dashboard\.html"[^>]*data-t="nav-dashboard"[^>]*>ADMIN LOGIN<\/a>\s*<\/li>/g;
const newNavLinks = `<li class="nav-item" style="margin-left:8px"><a href="login.html" class="nav-link" data-t="nav-login">LOGIN</a></li><li class="nav-item" style="margin-left:8px"><a href="signup.html" class="nav-link" data-t="nav-signup" style="background:var(--g1, #1a73e8);color:#fff;padding:8px 16px;border-radius:20px;font-weight:600;">SIGNUP</a></li>`;

for (const file of files) {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Let's also accommodate any direct mobile links just in case
        const mobileNavRegex = /<a[^>]*href="dashboard\.html"[^>]*data-t="nav-dashboard"[^>]*>ADMIN LOGIN<\/a>/g;
        const newMobileLinks = `<a class="mobile-link" href="login.html" data-t="nav-login">LOGIN</a> <a class="mobile-link" href="signup.html" data-t="nav-signup">SIGNUP</a>`;
        
        let newContent = content.replace(desktopNavRegex, newNavLinks);
        
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            replaceCount++;
            console.log(`Updated HTML ${file}`);
        }
    }
}

// Update main.js
const mainJsPath = path.join(dir, 'js', 'main.js');
if (fs.existsSync(mainJsPath)) {
    let mainJs = fs.readFileSync(mainJsPath, 'utf8');
    let newMainJs = mainJs.replace(
        /'nav-dashboard': \{ en: 'ADMIN LOGIN', hi: 'एडमिन लॉगिन' \},/,
        `'nav-login': { en: 'LOGIN', hi: 'लॉगिन' },\n  'nav-signup': { en: 'SIGNUP', hi: 'साइन अप' },`
    );
    if (mainJs !== newMainJs) {
        fs.writeFileSync(mainJsPath, newMainJs, 'utf8');
        console.log(`Updated main.js`);
        
        // Optional: minify main.js to main.min.js if terser is installed, but we can do it via npm run build if script exists or manually replace in min as well.
    }
}

// Update main.min.js
const minJsPath = path.join(dir, 'js', 'main.min.js');
if (fs.existsSync(minJsPath)) {
    let minJs = fs.readFileSync(minJsPath, 'utf8');
    let newMinJs = minJs.replace(
        /"nav-dashboard":\{en:"ADMIN LOGIN",hi:"एडमिन लॉगिन"\}/g,
        `"nav-login":{en:"LOGIN",hi:"लॉगिन"},"nav-signup":{en:"SIGNUP",hi:"साइन अप"}`
    );
    if (minJs !== newMinJs) {
        fs.writeFileSync(minJsPath, newMinJs, 'utf8');
        console.log(`Updated main.min.js`);
    }
}

console.log(`Done. Updated ${replaceCount} HTML files.`);
