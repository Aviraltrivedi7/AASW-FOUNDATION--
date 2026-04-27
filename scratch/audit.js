const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'aasw-pro');

function scanFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if(file !== 'node_modules' && file !== '.git') {
                scanFiles(fullPath);
            }
        } else if (fullPath.endsWith('.html')) {
            checkFile(fullPath);
        }
    }
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(dirPath, filePath);
    console.log(`\n--- Scanning ${relativePath} ---`);

    // 1. Check for Lorem Ipsum
    if (content.toLowerCase().includes('lorem ipsum')) {
        console.log('⚠️ Found "Lorem ipsum" placeholder text');
    }

    // 2. Check for empty links
    const emptyLinks = (content.match(/href="#"/g) || []).length;
    if (emptyLinks > 0) {
        console.log(`⚠️ Found ${emptyLinks} empty links (href="#")`);
    }

    // 3. Check for TODOs
    if (content.includes('TODO')) {
        console.log('⚠️ Found "TODO" comment or text');
    }

    // 4. Check for broken internal links
    const srcMatches = content.match(/src="([^"]+)"/g) || [];
    for (const match of srcMatches) {
        const src = match.replace(/src="(.*)"/,'$1');
        if (src.startsWith('/') && !src.startsWith('//')) {
             const targetPath = path.join(dirPath, src);
             if (!fs.existsSync(targetPath)) {
                 console.log(`❌ Broken src link: ${src}`);
             }
        }
    }
    
    // Check hrefs starting with /  (ignoring external links)
    const hrefMatches = content.match(/href="(\/[^"]*)"/g) || [];
    for(const match of hrefMatches) {
        let href = match.replace(/href="(.*)"/,'$1');
        // skip anchor links entirely
         if(href.includes('#')) {
             href = href.split('#')[0];
         }
         
         if(href === "" || href === "/") continue;

         // In our server setup, /team routes to team.html if /team doesn't exist.
         // We should check if the mapped .html file exists.
         let targetPath = path.join(dirPath, href);
         
         if (!fs.existsSync(targetPath)) {
             // Try appending .html
             let htmlTargetPath = path.join(dirPath, href + '.html');
             if(!fs.existsSync(htmlTargetPath)) {
                 console.log(`❌ Potentially broken href link: ${href}`);
             }
         }
    }
}

console.log("Starting audit...");
scanFiles(dirPath);
console.log("\nAudit complete.");
