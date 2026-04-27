const fs = require('fs');
const path = require('path');

const basePath = 'c:\\Users\\trive\\Downloads\\AASW-Foundation-Website\\aasw-pro';
const files = ['index.html', 'team.html', 'membership.html', 'governance.html', 'programs.html', 'reports.html', 'stories.html', 'privacy.html', 'refund.html'];

let totalChanges = 0;

for (const file of files) {
  const filePath = path.join(basePath, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Add lazy loading to all images (except logo which should load eagerly)
  // Match <img tags that don't have loading attribute
  content = content.replace(/<img(?![^>]*loading=)([^>]*src="\/images\/(?!logo)[^"]*"[^>]*)>/gi, (match, attrs) => {
    changes++;
    return `<img loading="lazy"${attrs}>`;
  });

  // 2. Add preconnect hints for Google Fonts and Tailwind CDN (add before the first <link> or <script> in <head>)
  const preconnects = `<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="dns-prefetch" href="https://cdn.tailwindcss.com">`;
  
  if (!content.includes('rel="preconnect"')) {
    content = content.replace(/<meta content="width=device-width[^"]*"[^>]*\/>\r?\n/, (match) => {
      changes++;
      return match + preconnects + '\n';
    });
  }

  // 3. Add defer to Tailwind CDN script if not already deferred (won't work with defer actually, skip this)
  // Tailwind CDN needs to run sync, so we skip this

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalChanges += changes;
    console.log(`✅ ${file}: ${changes} optimizations`);
  } else {
    console.log(`⏭️  ${file}: already optimized`);
  }
}

console.log(`\nDone! ${totalChanges} total optimizations applied.`);
