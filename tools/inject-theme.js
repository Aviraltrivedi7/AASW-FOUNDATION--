const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', 'aasw-pro');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

// Tags to inject
const cssTag = '<link rel="stylesheet" href="/css/light-mode.css">';
const jsTag = '<script src="/js/theme.js"></script>';

let injected = 0;

for (const file of htmlFiles) {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Inject light-mode.css before </head>
    if (!content.includes('light-mode.css')) {
        content = content.replace('</head>', cssTag + '</head>');
        changed = true;
    }

    // 2. Inject theme.js before </body> (early, before other scripts)
    if (!content.includes('theme.js')) {
        // Try to inject right after <body...>
        const bodyMatch = content.match(/<body[^>]*>/);
        if (bodyMatch) {
            const bodyTag = bodyMatch[0];
            content = content.replace(bodyTag, bodyTag + jsTag);
        } else {
            content = content.replace('</body>', jsTag + '</body>');
        }
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content);
        injected++;
        console.log(`Injected in ${file}`);
    }
}

console.log(`\nInjected CSS + JS in ${injected} HTML files.`);

// 3. Fix "Apply to Volunteer" button in team.html
const teamPath = path.join(rootDir, 'team.html');
if (fs.existsSync(teamPath)) {
    let teamContent = fs.readFileSync(teamPath, 'utf8');

    // Add onclick to the volunteer button if it doesn't have one
    if (teamContent.includes('Apply to Volunteer') && !teamContent.includes('volunteerModal')) {
        // Replace the button to open a modal
        teamContent = teamContent.replace(
            /(<button[^>]*>Apply to Volunteer<\/button>)/,
            '<button onclick="document.getElementById(\'volunteerModal\').classList.remove(\'hidden\');document.body.style.overflow=\'hidden\'" class="bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 px-10 rounded-lg hover:shadow-[0_0_30px_rgba(148,170,255,0.4)] transition-all transform hover:-translate-y-1">Apply to Volunteer</button>'
        );

        // Inject volunteer modal before </body>
        const volunteerModal = `<div id="volunteerModal" class="fixed inset-0 z-[200] hidden"><div class="absolute inset-0 bg-black/80 backdrop-blur-sm" onclick="document.getElementById('volunteerModal').classList.add('hidden');document.body.style.overflow='auto'"></div><div class="absolute inset-x-4 top-10 bottom-10 md:inset-x-20 md:top-12 md:bottom-12 bg-surface-container-highest rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden"><div class="flex justify-between items-center p-6 md:px-10 md:py-8 border-b border-white/10 bg-surface-container-highest relative z-10"><h2 class="text-xl md:text-3xl font-headline font-extrabold text-white flex items-center gap-4"><div class="hidden sm:flex w-12 h-12 bg-secondary/20 rounded-full items-center justify-center border border-secondary/30"><span class="material-symbols-outlined text-secondary">volunteer_activism</span></div>Apply to Volunteer</h2><button onclick="document.getElementById('volunteerModal').classList.add('hidden');document.body.style.overflow='auto'" class="w-12 h-12 shrink-0 rounded-full glass border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 hover:rotate-90 transition-all"><span class="material-symbols-outlined">close</span></button></div><div class="p-6 md:p-12 overflow-y-auto custom-scrollbar relative bg-surface-container"><div class="max-w-2xl mx-auto space-y-8"><p class="text-on-surface-variant text-lg leading-relaxed">We're always looking for passionate individuals to join our mission. Fill in your details below and we'll get back to you soon!</p><form id="volunteerForm" class="space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Full Name *</label><input id="volName" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4" placeholder="Your full name" type="text" required></div><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Email *</label><input id="volEmail" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4" placeholder="you@example.com" type="email" required></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Phone</label><input id="volPhone" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4" placeholder="+91 9876543210" type="tel"></div><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">City / District</label><input id="volCity" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4" placeholder="Your city" type="text"></div></div><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Area of Interest</label><select id="volInterest" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4"><option value="">Select an area...</option><option value="digital-training">Digital Skill Training</option><option value="mentorship">Mentorship & Support</option><option value="events">Events & Workshops</option><option value="field-work">Field Work</option><option value="content">Content & Social Media</option><option value="other">Other</option></select></div><div class="space-y-2"><label class="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Why do you want to volunteer?</label><textarea id="volMessage" class="w-full bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-secondary text-white py-3 px-4" placeholder="Tell us a bit about yourself and what motivates you..." rows="4"></textarea></div><button type="submit" id="volSubmitBtn" class="w-full bg-gradient-to-r from-secondary to-secondary-container text-on-secondary py-4 rounded-xl font-label text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-transform">Submit Application</button></form></div></div></div></div>`;

        // Add the modal + form handler script
        const formScript = `<script>document.addEventListener('DOMContentLoaded',function(){var f=document.getElementById('volunteerForm');if(!f)return;f.addEventListener('submit',async function(e){e.preventDefault();var btn=document.getElementById('volSubmitBtn');var name=document.getElementById('volName').value;var email=document.getElementById('volEmail').value;var phone=document.getElementById('volPhone').value;var city=document.getElementById('volCity').value;var interest=document.getElementById('volInterest').value;var message=document.getElementById('volMessage').value;if(!name||name.length<2){alert('Please enter your name');return}if(!email){alert('Please enter your email');return}btn.textContent='Submitting...';btn.disabled=true;try{var res=await fetch('/api/v1/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,subject:'Volunteer Application — '+interest,message:'Phone: '+(phone||'N/A')+'\\nCity: '+(city||'N/A')+'\\nInterest: '+(interest||'N/A')+'\\n\\n'+message})});if(res.ok){f.reset();document.getElementById('volunteerModal').classList.add('hidden');document.body.style.overflow='auto';var toast=document.getElementById('toast');if(toast){toast.textContent='\\u2713 Volunteer application submitted!';toast.className='toast success show';setTimeout(function(){toast.classList.remove('show')},4000)}}else{alert('Failed to submit. Please try again.')}}catch(err){alert('Network error. Please try again.')}finally{btn.textContent='Submit Application';btn.disabled=false}})});</script>`;

        teamContent = teamContent.replace('</body>', volunteerModal + formScript + '</body>');
        fs.writeFileSync(teamPath, teamContent);
        console.log('Fixed volunteer button + added modal in team.html');
    }
}

console.log('\nDone!');
