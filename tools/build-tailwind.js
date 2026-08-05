const { execSync } = require('child_process');
const path = require('path');

console.log('Compiling CSS via Tailwind CLI...');
try {
    execSync('npx tailwindcss -i ./aasw-pro/css/input.css -o ./aasw-pro/css/tailwind-compiled.css --minify', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✓ Tailwind compilation successful');
} catch (err) {
    console.error('Tailwind compilation failed:', err.message);
    process.exit(1);
}
