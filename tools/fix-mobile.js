const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../aasw-pro');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let original = content;
    
    // Fix huge paddings on mobile
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\bpx-12\b/g, 'px-6 md:px-12');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\bpx-8\b/g, 'px-4 md:px-8');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\bpy-32\b/g, 'py-16 md:py-32');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\bpy-24\b/g, 'py-16 md:py-24');
    
    // Fix text cutting off by adding break-words
    content = content.replace(/class="([^"]*text-on-surface-variant[^"]*)"/g, (match, p1) => {
        if(!p1.includes('break-words')) return `class="${p1} break-words"`;
        return match;
    });

    // Fix huge text sizes on mobile
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\btext-5xl\b/g, 'text-4xl md:text-5xl');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\btext-6xl\b/g, 'text-4xl md:text-6xl');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\btext-7xl\b/g, 'text-5xl md:text-7xl');
    content = content.replace(/(?<!md:|lg:|xl:|sm:)\btext-8xl\b/g, 'text-5xl md:text-8xl');

    // Add max-w-full and object-cover to images to prevent horizontal overflow and weird stretching
    content = content.replace(/<img([^>]*)class="([^"]*)"([^>]*)>/g, (match, p1, p2, p3) => {
        let classes = p2.split(' ');
        if (!classes.includes('max-w-full')) classes.push('max-w-full');
        if (!classes.includes('object-cover') && !classes.includes('object-contain') && !classes.includes('h-14') && !classes.includes('h-24')) {
            classes.push('object-cover');
        }
        return `<img${p1}class="${classes.join(' ')}"${p3}>`;
    });

    // Fix images without class attribute
    content = content.replace(/<img((?!class=)[^>])+>/g, (match) => {
        if (match.includes('class=')) return match;
        return match.replace('<img', '<img class="max-w-full object-cover"');
    });

    // Also add overflow-x-hidden to body to prevent horizontal scrolling
    content = content.replace(/<body class="([^"]*)"/, (match, p1) => {
        if(!p1.includes('overflow-x-hidden')) return `<body class="${p1} overflow-x-hidden"`;
        return match;
    });

    if (content !== original) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('Fixed:', file);
    }
});
