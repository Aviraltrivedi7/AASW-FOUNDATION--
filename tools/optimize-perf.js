const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'aasw-pro');

function processFile(filePath) {
    const ext = path.extname(filePath);
    if (ext !== '.html' && ext !== '.js' && ext !== '.css') return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    if (ext === '.html') {
        // Optimize glass class
        content = content.replace(
            /\.glass\s*\{[^}]*backdrop-filter:\s*blur\([^)]+\)[^}]*\}/g,
            (match) => {
                if (!match.includes('will-change')) {
                    return match.replace('}', ' will-change: transform, backdrop-filter; transform: translateZ(0); }');
                }
                return match;
            }
        );
        content = content.replace(
            /\.glass-header\s*\{[^}]*backdrop-filter:\s*blur\([^)]+\)[^}]*\}/g,
            (match) => {
                if (!match.includes('will-change')) {
                    return match.replace('}', ' will-change: transform, backdrop-filter; transform: translateZ(0); }');
                }
                return match;
            }
        );

        // Throttle inline scroll event listeners
        const scrollRegex = /window\.addEventListener\(\s*['"]scroll['"]\s*,\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\);/g;
        content = content.replace(scrollRegex, (match, body) => {
            if (body.includes('requestAnimationFrame') && body.includes('ticking')) return match; // Already throttled
            
            return `let tickingScroll = false;
window.addEventListener('scroll', () => {
    if (!tickingScroll) {
        window.requestAnimationFrame(() => {
            ${body.trim()}
            tickingScroll = false;
        });
        tickingScroll = true;
    }
}, { passive: true });`;
        });
    }

    if (ext === '.js') {
        // Specifically for main.js - we'll just throttle the general scroll listeners if they aren't already
        const scrollRegex = /window\.addEventListener\(\s*['"]scroll['"]\s*,\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*\)(;?)/g;
        let counter = 0;
        content = content.replace(scrollRegex, (match, body, semi) => {
            if (body.includes('requestAnimationFrame') && body.includes('isScrolling')) return match;
            counter++;
            return `let isScrolling${counter} = false;
window.addEventListener('scroll', () => {
    if (!isScrolling${counter}) {
        window.requestAnimationFrame(() => {
            ${body.trim()}
            isScrolling${counter} = false;
        });
        isScrolling${counter} = true;
    }
}, { passive: true })${semi}`;
        });
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Optimized ${filePath}`);
    }
}

function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDirectory(fullPath);
        } else {
            processFile(fullPath);
        }
    }
}

traverseDirectory(directoryPath);
console.log('Performance optimization completed.');
