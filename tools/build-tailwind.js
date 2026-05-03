const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const indexHtmlPath = path.join(__dirname, '..', 'aasw-pro', 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const scriptMatch = indexHtmlContent.match(/<script id="tailwind-config">\s*tailwind\.config\s*=\s*(\{[\s\S]*?\})\s*<\/script>/);

if (scriptMatch) {
    const configString = scriptMatch[1];
    
    // Create tailwind.config.js
    const tailwindConfigPath = path.join(__dirname, '..', 'tailwind.config.js');
    const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${configString.replace(/}\s*$/, ',\n  content: ["./aasw-pro/**/*.html", "./aasw-pro/**/*.js"]\n}')};\n`;
    fs.writeFileSync(tailwindConfigPath, tailwindConfigContent, 'utf8');
    console.log('Created tailwind.config.js');

    // Create input.css
    const inputCssPath = path.join(__dirname, '..', 'aasw-pro', 'css', 'input.css');
    fs.writeFileSync(inputCssPath, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n', 'utf8');
    console.log('Created aasw-pro/css/input.css');

    // Install tailwindcss
    console.log('Installing tailwindcss...');
    execSync('npm install -D tailwindcss@3.4', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    // Compile CSS
    console.log('Compiling CSS...');
    execSync('npx tailwindcss -i ./aasw-pro/css/input.css -o ./aasw-pro/css/tailwind-compiled.css --minify', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

    // Update HTML files
    const aaswProPath = path.join(__dirname, '..', 'aasw-pro');
    const replaceInHtmlFiles = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                replaceInHtmlFiles(filePath);
            } else if (filePath.endsWith('.html')) {
                let html = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                if (html.includes('https://cdn.tailwindcss.com')) {
                    html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com.*"><\/script>\n?/g, '');
                    modified = true;
                }
                
                if (html.includes('<script id="tailwind-config">')) {
                    html = html.replace(/<script id="tailwind-config">[\s\S]*?<\/script>\n?/g, '');
                    modified = true;
                }
                
                if (modified) {
                    // Add stylesheet link if not present
                    if (!html.includes('tailwind-compiled.css')) {
                        html = html.replace('</head>', '    <link href="/css/tailwind-compiled.css" rel="stylesheet" />\n</head>');
                    }
                    fs.writeFileSync(filePath, html, 'utf8');
                    console.log(`Updated ${filePath}`);
                }
            }
        }
    };
    
    replaceInHtmlFiles(aaswProPath);
    console.log('Done optimizing Tailwind.');
} else {
    console.log('Could not find tailwind config in index.html');
}
