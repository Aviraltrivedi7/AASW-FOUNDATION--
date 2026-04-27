const fs = require('fs');
const path = require('path');

const missingUrls = [];

const checkDirectory = (dir) => {
    let files;
    try { files = fs.readdirSync(dir); } catch(e) { return ; }
    const htmlFiles = files.filter(f => f.endsWith('.html') || f.endsWith('.ejs'));
    
    htmlFiles.forEach(file => {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const hrefRegex = /href=["']([^"']+)["']/g;
        let match;
        while ((match = hrefRegex.exec(content)) !== null) {
            let link = match[1];
            if (link.startsWith('http') || link.startsWith('mailto') || link.startsWith('tel') || link.startsWith('#')) {
                continue;
            }
            link = link.split('?')[0].split('#')[0];
            if (link.startsWith('/')) link = link.slice(1);
            if (!link) continue;
            try { link = decodeURIComponent(link); } catch (e) {}
            if (link.endsWith('/')) link = link.slice(0, -1);
            
            let targetPath1 = path.join('aasw-pro', link);
            let targetPath2 = path.join('aasw-pro', link + '.html');
            let targetPath3 = path.join('views', link);
            let targetPath4 = path.join('views', link + '.ejs');
            
            if (!fs.existsSync(targetPath1) && !fs.existsSync(targetPath2) && !fs.existsSync(targetPath3) && !fs.existsSync(targetPath4)) {
                if (!link.startsWith('api/') && !link.startsWith('admin')) {
                     missingUrls.push({ file: filePath, link, type: 'href' });
                }
            }
        }
        
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
                missingUrls.push({ file: filePath, link: src, type: 'src' });
            }
        }
    });
};

checkDirectory('views');
checkDirectory('views/partials');
if (missingUrls.length) {
    missingUrls.forEach(m => console.log('Missing '+m.type+' '+m.link+' in '+m.file));
} else {
    console.log('All local links in views are valid!');
}
