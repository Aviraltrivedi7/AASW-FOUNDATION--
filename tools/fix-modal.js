const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'aasw-pro', 'index.html');
let content = fs.readFileSync(file, 'utf8');

console.log('File size before:', content.length);

// The orphaned modal content starts right after the footer copyright section
// and before the schema markup. Find and remove it.

// The orphaned content starts with the Objective/Aim cards that are
// randomly inside the footer:
// <div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="bg-surface-container-lowest p-8 rounded-[2rem] border border-primary/20...">target</span> Our Objective...

const orphanStart = content.indexOf('<div class="grid grid-cols-1 md:grid-cols-2 gap-8"><div class="bg-surface-container-lowest p-8');

if (orphanStart === -1) {
    console.log('Orphaned content not found via first marker');
    process.exit(1);
}

// The orphaned content ends with the success stories placeholder and multiple closing divs
// Right before the schema script tag
const schemaStart = content.indexOf('<script type="application/ld+json">');

if (schemaStart === -1) {
    console.log('Schema marker not found');
    process.exit(1);
}

// Find the closing </footer> tag that should be before the orphan
const footerClose = content.lastIndexOf('</footer>', orphanStart);
console.log('Footer close at:', footerClose);
console.log('Orphan starts at:', orphanStart);
console.log('Schema starts at:', schemaStart);

// Everything between footerClose+9 and schemaStart is orphaned modal content
const orphanContent = content.substring(orphanStart, schemaStart);
console.log('Orphan content length:', orphanContent.length);
console.log('Orphan content starts with:', orphanContent.substring(0, 100));
console.log('Orphan content ends with:', orphanContent.substring(orphanContent.length - 100));

// Remove the orphaned content
content = content.substring(0, orphanStart) + '\n' + content.substring(schemaStart);

// Now find where to insert the clean About modal
// It should go right before </body>
const bodyClose = content.indexOf('</body>');

const cleanModal = `<div id="aboutModal" class="fixed inset-0 z-[200] hidden">
<div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick='document.getElementById("aboutModal").classList.add("hidden"),document.body.style.overflow="auto"'></div>
<div class="absolute inset-x-4 top-10 bottom-10 md:inset-x-20 md:top-12 md:bottom-12 bg-surface-container-highest rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
<div class="flex justify-between items-center p-6 md:px-10 md:py-8 border-b border-white/10 bg-surface-container-highest relative z-10">
<h2 class="text-xl md:text-3xl font-headline font-extrabold text-white flex items-center gap-4">
<div class="hidden sm:flex w-12 h-12 bg-primary/20 rounded-full items-center justify-center border border-primary/30">
<span class="material-symbols-outlined text-primary">info</span>
</div>About AASW Foundation</h2>
<button onclick='document.getElementById("aboutModal").classList.add("hidden"),document.body.style.overflow="auto"' class="w-12 h-12 shrink-0 rounded-full glass border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 hover:rotate-90 transition-all">
<span class="material-symbols-outlined">close</span></button></div>
<div class="p-6 md:p-12 overflow-y-auto custom-scrollbar relative bg-surface-container">
<div class="absolute top-0 right-0 w-96 h-96 aura-purple blur-[100px] opacity-20 pointer-events-none"></div>
<div class="max-w-4xl mx-auto space-y-12 text-on-surface-variant leading-relaxed">
<div class="space-y-6">
<h3 class="text-3xl font-headline font-black text-white">Fueling Women's Success Through Tech & Enterprise</h3>
<p class="text-lg">AASW Foundation was founded to change the reality for women in Uttar Pradesh. We're dedicated to bridging the divide in digital business ownership — building confident, capable, and connected women leaders.</p>
<p class="text-lg"><strong class="text-primary font-bold">Stronger women create a better world — socially, environmentally, and financially.</strong></p>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="glass p-8 rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors">
<div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center"><span class="material-symbols-outlined text-primary">target</span></div><h4 class="text-xl font-bold text-primary">Our Objective</h4></div>
<p>To encourage women in digital entrepreneurship by providing digital tools, environmental awareness, and business mentoring for inclusive economic growth.</p></div>
<div class="glass p-8 rounded-2xl border border-tertiary/20 hover:border-tertiary/40 transition-colors">
<div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 bg-tertiary/20 rounded-xl flex items-center justify-center"><span class="material-symbols-outlined text-tertiary">visibility</span></div><h4 class="text-xl font-bold text-tertiary">Our Aim</h4></div>
<p>Women becoming inventors and decision-makers, using technology and business to create a sustainable, just society.</p></div>
</div>
<div class="space-y-6"><h3 class="text-2xl font-bold text-white">What We Do</h3>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
<div class="glass p-5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors"><div class="flex items-center gap-3 mb-2"><span class="material-symbols-outlined text-primary text-xl">laptop_mac</span><strong class="text-white text-sm">Digital Skills</strong></div><p class="text-xs">E-commerce, Social Media Marketing, and Online Operations training.</p></div>
<div class="glass p-5 rounded-xl border border-white/5 hover:border-secondary/20 transition-colors"><div class="flex items-center gap-3 mb-2"><span class="material-symbols-outlined text-secondary text-xl">eco</span><strong class="text-white text-sm">Green Enterprise</strong></div><p class="text-xs">Ecologically conscious solutions and sustainable business practices.</p></div>
<div class="glass p-5 rounded-xl border border-white/5 hover:border-tertiary/20 transition-colors"><div class="flex items-center gap-3 mb-2"><span class="material-symbols-outlined text-tertiary text-xl">groups</span><strong class="text-white text-sm">Mentorship</strong></div><p class="text-xs">Professional guidance for building and scaling businesses.</p></div>
<div class="glass p-5 rounded-xl border border-white/5 hover:border-primary/20 transition-colors"><div class="flex items-center gap-3 mb-2"><span class="material-symbols-outlined text-primary text-xl">video_library</span><strong class="text-white text-sm">Workshops</strong></div><p class="text-xs">Leadership development, financial literacy, and digital innovation.</p></div>
<div class="glass p-5 rounded-xl border border-white/5 hover:border-secondary/20 transition-colors sm:col-span-2 lg:col-span-1"><div class="flex items-center gap-3 mb-2"><span class="material-symbols-outlined text-secondary text-xl">forum</span><strong class="text-white text-sm">Community</strong></div><p class="text-xs">Peer learning and collaboration network for entrepreneurs.</p></div>
</div></div>
<div class="space-y-6"><h3 class="text-2xl font-bold text-white">Our Impact</h3>
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
<div class="text-center glass p-6 rounded-2xl border border-primary/20"><div class="text-3xl font-black text-primary">800+</div><div class="text-xs text-on-surface-variant mt-1">Women Trained</div></div>
<div class="text-center glass p-6 rounded-2xl border border-secondary/20"><div class="text-3xl font-black text-secondary">300+</div><div class="text-xs text-on-surface-variant mt-1">Businesses</div></div>
<div class="text-center glass p-6 rounded-2xl border border-tertiary/20"><div class="text-3xl font-black text-tertiary">30+</div><div class="text-xs text-on-surface-variant mt-1">Eco Projects</div></div>
<div class="text-center glass p-6 rounded-2xl border border-white/10"><div class="text-3xl font-black text-white">5+</div><div class="text-xs text-on-surface-variant mt-1">Districts</div></div>
</div></div>
<div class="text-center pt-8 border-t border-white/10 space-y-6">
<h3 class="text-2xl md:text-3xl font-headline font-black text-white">Together, we'll create a future where women <span class="text-gradient">lead the digital revolution.</span></h3>
<div class="flex flex-col sm:flex-row gap-4 justify-center">
<a href="/membership.html" class="bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-3 rounded-xl font-label text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform text-center">Support Now</a>
<a href="/team.html" class="glass border border-white/10 text-white px-8 py-3 rounded-xl font-label text-sm font-bold uppercase tracking-widest hover:bg-white/5 transition-all text-center">Join as Volunteer</a>
</div></div>
</div></div></div></div>\n`;

content = content.substring(0, bodyClose) + cleanModal + content.substring(bodyClose);

console.log('File size after:', content.length);
fs.writeFileSync(file, content);
console.log('✅ Orphaned modal content removed and clean modal added!');
