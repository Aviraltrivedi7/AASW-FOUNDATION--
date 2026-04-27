const fs = require('fs');
const path = require('path');

const cssDir = 'c:/Users/trive/Downloads/AASW-Foundation-Website/aasw-pro/css';
let files;
try { files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css')); } catch (e) {
  console.log('No css dir');
  files = [];
}

const missing = [];
files.forEach(f => {
   const cssPath = path.join(cssDir, f);
   const content = fs.readFileSync(cssPath, 'utf8');
   const urlRegex = /url\(["']?([^"'\)]+)["']?\)/g;
   let match;
   while ((match = urlRegex.exec(content)) !== null) {
      let fpath = match[1];
      if (fpath.startsWith('http') || fpath.startsWith('data:')) continue;
      fpath = fpath.split('?')[0].split('#')[0];
      
      let target;
      if (fpath.startsWith('/')) {
         target = path.join('c:/Users/trive/Downloads/AASW-Foundation-Website/aasw-pro', fpath.slice(1));
      } else {
         target = path.resolve(cssDir, fpath);
      }
      
      if (!fs.existsSync(target)) {
         try {
             const decodedPath = decodeURIComponent(target);
             if (!fs.existsSync(decodedPath)) {
                 missing.push('Missing CSS BG: ' + decodedPath + ' in ' + f);
             }
         } catch (e) {
             missing.push('Missing CSS BG (raw): ' + target + ' in ' + f);
         }
      }
   }
});
if (missing.length) {
    missing.forEach(m => console.log(m));
} else {
    console.log('All CSS background imagery and fonts exist!');
}
