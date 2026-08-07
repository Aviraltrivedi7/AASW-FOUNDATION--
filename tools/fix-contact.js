const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'aasw-pro', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add Phone Number field with +91 prefix in the contact form
// Find the Subject input and add Phone field after the Name+Email grid and before Subject
const subjectBlock = `<div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant break-words">Subject</label> <input id="contactSubject"`;

const phoneFieldAndSubject = `<div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant break-words">Phone Number</label><div class="flex"><span class="inline-flex items-center px-4 bg-surface-container-highest border border-white/10 rounded-l-xl text-white text-sm font-bold">+91</span><input id="contactPhone" class="w-full bg-surface-container-high border-none rounded-r-xl focus:ring-2 focus:ring-primary text-white py-3 px-4" placeholder="9876543210" type="tel" pattern="[0-9]{10}" maxlength="10"></div></div><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant break-words">Subject</label> <input id="contactSubject"`;

html = html.replace(subjectBlock, phoneFieldAndSubject);

// 2. Add more address and phone info on the right side contact info
// Find the existing phone section and add WhatsApp & alternate office address
const oldPhoneSection = `<div class="space-y-1"><h4 class="font-headline font-bold text-white text-lg">Call Support</h4><p class="text-on-surface-variant break-words">+91 9984156418</p><p class="text-on-surface-variant break-words">+91 7007276735</p></div></div></div>`;

const newPhoneSection = `<div class="space-y-1"><h4 class="font-headline font-bold text-white text-lg">Call Support</h4><p class="text-on-surface-variant break-words">+91 9984156418</p><p class="text-on-surface-variant break-words">+91 7007276735</p></div></div><div class="flex gap-6 items-start"><div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20"><span class="material-symbols-outlined text-primary">chat</span></div><div class="space-y-1"><h4 class="font-headline font-bold text-white text-lg">WhatsApp</h4><p class="text-on-surface-variant break-words">+91 9984156418</p></div></div><div class="flex gap-6 items-start"><div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0 border border-secondary/20"><span class="material-symbols-outlined text-secondary">schedule</span></div><div class="space-y-1"><h4 class="font-headline font-bold text-white text-lg">Office Hours</h4><p class="text-on-surface-variant break-words">Mon – Sat: 10:00 AM – 6:00 PM</p></div></div></div>`;

html = html.replace(oldPhoneSection, newPhoneSection);

fs.writeFileSync(indexPath, html);
console.log('✓ Contact section updated with phone field (+91 prefix) and extra contact info');
