const fs = require('fs');
let content = fs.readFileSync('aasw-pro/membership.html', 'utf8');

// We are replacing the exact SweetAlert success message in verify handler
content = content.replace(
    /Swal\.fire\(\s*\{\s*icon:\s*['"]success['"],\s*title:\s*['"]Payment Successful!['"],\s*text:\s*['"]Welcome to the AASW Foundation!['"]\s*\}\s*\);?/g,
    `Swal.fire({
        title: 'Payment Successful!',
        html: \`
            <div class="space-y-4">
                <p>Welcome to the AASW Foundation! Your membership is confirmed.</p>
                <div class="mt-4">
                    <a href="/api/v1/membership/certificate/\${data.data.membershipId}" target="_blank" class="inline-block bg-[#94aaff] text-[#072776] px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform" style="text-decoration: none;">
                        Download Certificate
                    </a>
                </div>
                <p class="text-xs text-gray-500 mt-2">We have also emailed you a copy.</p>
            </div>
        \`,
        icon: 'success',
        confirmButtonColor: '#94aaff'
    });`
);

fs.writeFileSync('aasw-pro/membership.html', content);

// Also do views/membership.ejs if it exists
if (fs.existsSync('views/membership.ejs')) {
    let ejsContent = fs.readFileSync('views/membership.ejs', 'utf8');
    ejsContent = ejsContent.replace(
        /Swal\.fire\(\s*\{\s*icon:\s*['"]success['"],\s*title:\s*['"]Payment Successful!['"],\s*text:\s*['"]Welcome to the AASW Foundation!['"]\s*\}\s*\);?/g,
        `Swal.fire({
            title: 'Payment Successful!',
            html: \`
                <div class="space-y-4">
                    <p>Welcome to the AASW Foundation! Your membership is confirmed.</p>
                    <div class="mt-4">
                        <a href="/api/v1/membership/certificate/\${data.data.membershipId}" target="_blank" class="inline-block bg-[#94aaff] text-[#072776] px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform" style="text-decoration: none;">
                            Download Certificate
                        </a>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">We have also emailed you a copy.</p>
                </div>
            \`,
            icon: 'success',
            confirmButtonColor: '#94aaff'
        });`
    );
    fs.writeFileSync('views/membership.ejs', ejsContent);
}

console.log('Fixed sweetness');
