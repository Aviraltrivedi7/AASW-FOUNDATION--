const fs = require('fs');
const path = require('path');

const checkDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.ejs'));
    const missingUrls = [];
    
    htmlFiles.forEach(file => {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Match href="..."
        const hrefRegex = /href=["']([^"']+)["']/g;
        let match;
        while ((match = hrefRegex.exec(content)) !== null) {
            let link = match[1];
            if (link.startsWith('http') || link.startsWith('mailto') || link.startsWith('tel') || link.startsWith('#')) {
                continue;
            }
            // Strip out query params and hash for local checks
            link = link.split('?')[0].split('#')[0];
            
            // Check if link exists. It could be /css/... or /js/... or /page
            // In our express app, static routes are relative to aasw-pro
            // Clean urls: /team -> /team.html
            if (link.startsWith('/')) link = link.slice(1);
            if (!link) continue;
            try { link = decodeURIComponent(link); } catch (e) {}

            if (link.endsWith('/')) link = link.slice(0, -1);
            
            // Expected file path
            let targetPath1 = path.join('aasw-pro', link);
            let targetPath2 = path.join('aasw-pro', link + '.html');
            
            if (!fs.existsSync(targetPath1) && !fs.existsSync(targetPath2)) {
                // Also check if there is an endpoint for it in backend or some exceptions
                if (!link.startsWith('api/') && !link.startsWith('admin')) {
                     // Might be missing!
                     missingUrls.push({ file, link, type: 'href' });
                }
            }
        }
        
        // Match src="..."
        const srcRegex = /src=["']([^"']+)["']/g;
        while ((match = srcRegex.exec(content)) !== null) {
            let src = match[1];
            if (src.startsWith('http') || src.startsWith('data:')) continue;
            
            src = src.split('?')[0].split('#')[0];
            if (src.startsWith('/')) src = src.slice(1);
            if (!src) continue;
            try { src = decodeURIComponent(src); } catch (e) {}
            
            let targetPath = path.join('aasw-pro', src);
            if (!fs.existsSync(targetPath)) {
                missingUrls.push({ file, link: src, type: 'src' });
            }
        }
    });
    
    return missingUrls;
};

const missing = checkDirectory('aasw-pro');
if (missing.length) {
    console.log("Missing URLs found:");
    missing.forEach(m => console.log(`In ${m.file}: missing ${m.type} -> ${m.link}`));
} else {
    console.log("All local links are valid!");
}
