const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'aasw-pro', 'index.html');
let content = fs.readFileSync(file, 'utf8');

// 1. Reduce hero height and add CTA buttons
// <section class="relative min-h-[100svh] lg:h-[921px] ...
content = content.replace(/min-h-\[100svh\] lg:h-\[921px\]/, 'min-h-[70vh] lg:h-[700px]');

// 2. Enhance hero overlay for better contrast
// <div class="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
content = content.replace(/via-background\/80 to-transparent/, 'via-background/90 to-background/50');

// 3. Add CTA buttons to Hero
if (!content.includes('href="/team.html" class="bg-gradient-to-r from-primary')) {
    const oldBtns = /<button onclick='document\.getElementById\("aboutModal"\)\.classList\.remove\("hidden"\),document\.body\.style\.overflow="hidden"' class="bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 px-10 rounded-lg hover:shadow-\[0_0_30px_rgba\(148,170,255,0\.4\)\] transition-all transform hover:-translate-y-1">Learn About Us<\/button>/;
    
    const newBtns = `<button onclick='document.getElementById("aboutModal").classList.remove("hidden"),document.body.style.overflow="hidden"' class="bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-4 px-10 rounded-lg hover:shadow-[0_0_30px_rgba(148,170,255,0.4)] transition-all transform hover:-translate-y-1">Learn About Us</button>
<a href="/team.html" class="glass text-white font-headline font-bold py-4 px-10 rounded-lg hover:bg-white/10 transition-all border border-white/20 transform hover:-translate-y-1">Join Us as Volunteer</a>`;
    
    content = content.replace(oldBtns, newBtns);
}

// 4. Fix Gallery Images (unprofessional timestamps)
// By adding object-cover and a slight scale/crop we might hide timestamps on the edges
// Let's replace 'object-cover' on gallery images with 'object-cover scale-110' 
// Wait, we can just add a style rule.
if (!content.includes('.gallery-img-crop')) {
    content = content.replace('</style>', '.gallery-img-crop { object-fit: cover; object-position: center; transform: scale(1.15); transition: transform 0.5s ease; } .gallery-card:hover .gallery-img-crop { transform: scale(1.25); }\n</style>');
    
    // find gallery images and add the class
    // Currently they are like <img class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
    content = content.replace(/class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/g, 'class="w-full h-full gallery-img-crop"');
}

fs.writeFileSync(file, content);
console.log('Hero and gallery fixed in index.html');
