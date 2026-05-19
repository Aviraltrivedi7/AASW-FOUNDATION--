const fs = require('fs');
const path = require('path');

// Load main.js to extract translations
const mainJsPath = path.join(__dirname, '..', 'aasw-pro', 'js', 'main.js');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf8');

// Simple regex to extract translation keys
const translationKeys = [];
const keyRegex = /'([^']+)':\s*\{\s*en:/g;
let match;
while ((match = keyRegex.exec(mainJsContent)) !== null) {
  translationKeys.push(match[1]);
}

console.log(`Found ${translationKeys.length} translation keys in main.js.`);

// Find all HTML files in aasw-pro
const htmlDir = path.join(__dirname, '..', 'aasw-pro');
const files = fs.readdirSync(htmlDir);
const htmlFiles = files.filter(f => f.endsWith('.html'));

const missingKeys = {};
const allDataTKeys = new Set();

htmlFiles.forEach(file => {
  const filePath = path.join(htmlDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex to extract all data-t="..." attributes
  const dataTRegex = /data-t="([^"]+)"/g;
  let tMatch;
  while ((tMatch = dataTRegex.exec(content)) !== null) {
    const key = tMatch[1];
    allDataTKeys.add(key);
    if (!translationKeys.includes(key)) {
      if (!missingKeys[file]) missingKeys[file] = [];
      missingKeys[file].push(key);
    }
  }
});

console.log('\n--- Missing Translation Keys (data-t in HTML but not defined in main.js) ---');
console.log(JSON.stringify(missingKeys, null, 2));

console.log('\n--- Unused Translation Keys (in main.js but not found in any HTML data-t) ---');
const unusedKeys = translationKeys.filter(k => !allDataTKeys.has(k));
console.log(unusedKeys);
