const fs = require('fs');
const { execSync } = require('child_process');

try {
    require.resolve('sharp');
} catch (e) {
    execSync('npm install sharp', { stdio: 'inherit' });
}
const sharp = require('sharp');

async function processImages() {
    const path = require('path');
    const imagesDir = path.join(__dirname, '..', 'aasw-pro', 'images');
    if (!fs.existsSync(imagesDir)) {
        console.log('No images directory found at ' + imagesDir);
        return;
    }
    
    const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
    for (let file of images) {
        const isFavicon = file === 'favicon.png';
        const name = file.substring(0, file.lastIndexOf('.'));
        const inputPath = path.join(imagesDir, file);

        if (isFavicon) {
            // Resize and compress favicon
            const tempPath = path.join(imagesDir, 'favicon-temp.png');
            await sharp(inputPath)
                .resize(32, 32)
                .png({ quality: 80, compressionLevel: 9 })
                .toFile(tempPath);
            fs.unlinkSync(inputPath);
            fs.renameSync(tempPath, inputPath);
            console.log('Processed favicon.png');
        } else {
            // Convert to webp
            const outPath = path.join(imagesDir, name + '.webp');
            if (fs.existsSync(outPath)) {
                console.log('Skipping', file, '- already converted');
                continue;
            }
            await sharp(inputPath)
                .webp({ quality: 80 })
                .toFile(outPath);
            fs.unlinkSync(inputPath);
            console.log('Converted', file, 'to webp');
        }
    }
}

processImages().catch(console.error);
