const fs = require('fs');

const files = [
    'aasw-pro/team.html', 
    'aasw-pro/membership.html', 
    'aasw-pro/governance.html', 
    'views/team.ejs', 
    'views/membership.ejs'
];

files.forEach(f => {
   if (fs.existsSync(f)) {
      let content = fs.readFileSync(f, 'utf8');
      
      let modified = false;
      
      if (content.includes('h-[921px]')) {
          content = content.replace(/h-\[921px\](.*?)flex items-center/g, 'min-h-[100svh] lg:h-[921px]$1flex items-center flex-col justify-center lg:block lg:flex-row');
          // Also fix the inner container to center properly on mobile
          content = content.replace(/relative z-10 max-w-7xl mx-auto px-6 md:px-12">/g, 'relative z-10 max-w-7xl mx-auto px-6 md:px-12 mt-32 lg:mt-0 flex flex-col justify-center h-full">');
          modified = true;
      }
      
      if (content.includes('h-[600px] object-cover')) {
          content = content.replace(/h-\[600px\] object-cover/g, 'h-[400px] lg:h-[600px] object-cover');
          modified = true;
      }
      
      if (modified) {
          fs.writeFileSync(f, content);
          console.log('Fixed ' + f);
      }
   }
});
console.log('Done fixing heights in secondary pages.');
