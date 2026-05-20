const fs = require('fs');
const path = require('path');

// Load i18n.js to extract translations
const i18nJsPath = path.join(__dirname, '..', 'aasw-pro', 'js', 'i18n.js');
const i18nJsContent = fs.readFileSync(i18nJsPath, 'utf8');

// Simple regex to extract translation keys
const translationKeys = [];
const keyRegex = /"([^"]+)":\s*\{\s*en:/g;
let match;
while ((match = keyRegex.exec(i18nJsContent)) !== null) {
  translationKeys.push(match[1]);
}

console.log(`Found ${translationKeys.length} translation keys in i18n.js.`);

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

console.log('\n--- Missing Translation Keys (data-t in HTML but not defined in i18n.js) ---');
console.log(JSON.stringify(missingKeys, null, 2));

console.log('\n--- Unused Translation Keys (in i18n.js but not found in any HTML data-t) ---');
const unusedKeys = translationKeys.filter(k => !allDataTKeys.has(k));
console.log(unusedKeys);
