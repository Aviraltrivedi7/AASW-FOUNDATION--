const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'aasw-pro', 'index.html');
let content = fs.readFileSync(file, 'utf8');

console.log('File size before:', content.length);

// Try different quote patterns to find the modal
const patterns = [
    'id="aboutModal"',
    "id='aboutModal'",
    'id=\\"aboutModal\\"',
    'id=&quot;aboutModal&quot;'
];

let modalStartIdx = -1;
let matchedPattern = '';
for (const p of patterns) {
    const idx = content.indexOf(p);
    if (idx !== -1) {
        modalStartIdx = idx;
        matchedPattern = p;
        break;
    }
}

console.log('Matched pattern:', matchedPattern, 'at index:', modalStartIdx);

if (modalStartIdx === -1) {
    // The modal div might be referenced as getElementById but the actual div
    // isn't in the HTML at all. Let's check.
    console.log('\nSearching for all "aboutModal" occurrences:');
    let si = 0;
    while ((si = content.indexOf('aboutModal', si)) !== -1) {
        console.log('  at', si, ':', content.substring(si - 30, si + 40).replace(/\n/g, '\\n'));
        si++;
    }
    
    // If the modal doesn't exist as a div, the button references it but it was never created
    // OR it's embedded inline. Let me search for '<div' near aboutModal
    console.log('\nSearching for div near aboutModal:');
    si = 0;
    while ((si = content.indexOf('aboutModal', si)) !== -1) {
        // Go backwards to find the nearest <div
        let back = content.lastIndexOf('<div', si);
        console.log('  Nearest div before aboutModal at', si, ':', content.substring(back, back+60));
        si++;
    }
}
