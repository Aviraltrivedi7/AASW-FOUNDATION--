const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
    require.resolve('html-minifier-terser');
} catch (e) {
    execSync('npm install html-minifier-terser clean-css terser', { stdio: 'inherit' });
}

const { minify: minifyHtml } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJs } = require('terser');

async function processFiles() {
    const baseDir = path.join(__dirname, '..', 'aasw-pro');
    
    // Combine CSS files
    let css1 = '';
    const styleCssPath = path.join(baseDir, 'css', 'style.css');
    if (fs.existsSync(styleCssPath)) {
        css1 = fs.readFileSync(styleCssPath, 'utf8').replace(/\.jpg/g, '.webp');
    }
    
    let css2 = '';
    const premiumCssPath = path.join(baseDir, 'css', 'premium.css');
    if (fs.existsSync(premiumCssPath)) {
        css2 = fs.readFileSync(premiumCssPath, 'utf8').replace(/\.jpg/g, '.webp');
    }

    // Minify CSS
    if (css1 || css2) {
        const minifiedCss = new CleanCSS({}).minify(css1 + '\n' + css2).styles;
        fs.writeFileSync(path.join(baseDir, 'css', 'style.min.css'), minifiedCss);
        console.log('✓ Minified CSS');
    }

    // Minify JS
    const mainJsPath = path.join(baseDir, 'js', 'main.js');
    if (fs.existsSync(mainJsPath)) {
        let js = fs.readFileSync(mainJsPath, 'utf8');
        const minifiedJs = await minifyJs(js);
        fs.writeFileSync(path.join(baseDir, 'js', 'main.min.js'), minifiedJs.code);
        console.log('✓ Minified JS');
    }

    // Process HTML files
    const replaceInHtmlFiles = async (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory() && file !== 'css' && file !== 'js' && file !== 'assets') {
                await replaceInHtmlFiles(filePath);
            } else if (filePath.endsWith('.html')) {
                let html = fs.readFileSync(filePath, 'utf8');
                
                // Update HTML with webp images and minified resources
                html = html.replace(/\.jpg/g, '.webp');
                html = html.replace(/\.png/g, '.webp');
                html = html.replace(/favicon\.webp/g, 'favicon.png');
                
                // Update HTML file references
                html = html.replace(/<link[^>]*href="css\/style\.css"[^>]*>\s*<link[^>]*href="css\/premium\.css"[^>]*>/g, '<link rel="stylesheet" href="css/style.min.css" />');
                html = html.replace(/<script[^>]*src="js\/main\.js"[^>]*><\/script>/g, '<script src="js/main.min.js"></script>');

                // Minify HTML
                try {
                    const resultHtml = await minifyHtml(html, {
                        collapseWhitespace: true,
                        removeComments: true,
                        minifyJS: true,
                        minifyCSS: true
                    });
                    fs.writeFileSync(filePath, resultHtml);
                    console.log(`✓ Minified ${file}`);
                } catch (err) {
                    console.error(`Error minifying ${file}:`, err.message);
                }
            }
        }
    };
    
    await replaceInHtmlFiles(baseDir);
    console.log('Minification and combination complete.');
}

processFiles().catch(console.error);
