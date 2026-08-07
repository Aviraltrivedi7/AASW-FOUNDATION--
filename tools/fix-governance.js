const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'aasw-pro', 'governance.html');
let html = fs.readFileSync(filePath, 'utf8');

// Find and remove the Registration & Compliance section
// It's a <section> containing "Registration & Compliance", "Statutory Identifiers", "ABCCA6275BF20251", etc.

// Try to find the section block containing these identifiers
// Since it's minified, let's use regex to find the section

// Strategy: find the section that contains "Statutory Identifiers" and remove it
const patterns = [
  // Try to match a section containing Registration & Compliance
  /(<section[^>]*>(?:(?!<\/section>).)*?Registration[^<]*Compliance(?:(?!<\/section>).)*?<\/section>)/s,
  /(<section[^>]*>(?:(?!<\/section>).)*?Statutory Identifiers(?:(?!<\/section>).)*?<\/section>)/s,
];

let removed = false;
for (const pattern of patterns) {
  const match = html.match(pattern);
  if (match) {
    console.log('Found section, length:', match[0].length);
    console.log('Preview:', match[0].substring(0, 200));
    html = html.replace(match[0], '');
    removed = true;
    break;
  }
}

if (!removed) {
  // Try a different approach - find the div containing these items
  // Look for the block with ABCCA6275BF20251
  const idx = html.indexOf('ABCCA6275BF20251');
  if (idx > -1) {
    console.log('Found ABCCA6275BF20251 at index:', idx);
    // Find the enclosing section
    let sectionStart = html.lastIndexOf('<section', idx);
    let sectionEnd = html.indexOf('</section>', idx);
    if (sectionStart > -1 && sectionEnd > -1) {
      sectionEnd += '</section>'.length;
      const section = html.substring(sectionStart, sectionEnd);
      console.log('Section length:', section.length);
      console.log('Section preview:', section.substring(0, 300));
      html = html.substring(0, sectionStart) + html.substring(sectionEnd);
      removed = true;
    }
  }
}

if (removed) {
  fs.writeFileSync(filePath, html);
  console.log('✓ Registration & Compliance section removed');
} else {
  console.log('❌ Could not find the section to remove');
}
