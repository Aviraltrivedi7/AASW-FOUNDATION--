const fs = require('fs');

// Fix membership.html
let content = fs.readFileSync('aasw-pro/membership.html', 'utf8');

const oldCode = `showToast('🎉 Payment successful! Welcome to AASW.', 'success');
                           form.reset();`;

const newCode = `const memberId = verifySignData.data && verifySignData.data.membershipId ? verifySignData.data.membershipId : '';
                          form.reset();
                          // Show premium success popup with certificate download
                          const successOverlay = document.createElement('div');
                          successOverlay.className = 'fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-xl';
                          successOverlay.innerHTML = \`
                              <div class="bg-surface-container border border-primary/30 p-10 rounded-3xl w-[90%] max-w-md shadow-2xl text-center relative overflow-hidden">
                                  <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full filter blur-[60px] pointer-events-none"></div>
                                  <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/20 rounded-full filter blur-[60px] pointer-events-none"></div>
                                  <div class="relative z-10">
                                      <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-tr from-[#22c55e]/20 to-[#4ade80]/20 border border-[#22c55e]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                          <span class="material-symbols-outlined text-[#22c55e] text-4xl">task_alt</span>
                                      </div>
                                      <h3 class="text-3xl font-headline font-extrabold mb-2 text-white">Welcome to AASW!</h3>
                                      <p class="text-on-surface-variant text-sm mb-8 leading-relaxed">Your membership is confirmed. Your certificate has been emailed to you.</p>
                                      <a href="/api/v1/membership/certificate/\${memberId}" target="_blank" class="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-on-primary px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(148,170,255,0.4)] hover:scale-105 transition-all" style="text-decoration:none;">
                                          <span class="material-symbols-outlined text-lg">download</span>
                                          Download Certificate
                                      </a>
                                      <p class="text-on-surface-variant/60 text-xs mt-4">A copy has also been sent to your email</p>
                                      <button onclick="this.closest('.fixed').remove()" class="mt-6 text-on-surface-variant text-xs uppercase tracking-widest hover:text-white transition-colors">Close</button>
                                  </div>
                              </div>
                          \`;
                          document.body.appendChild(successOverlay);`;

if (content.includes(oldCode)) {
    content = content.replace(oldCode, newCode);
    fs.writeFileSync('aasw-pro/membership.html', content);
    console.log('SUCCESS: membership.html updated with certificate download popup');
} else {
    console.log('WARNING: Exact match not found, trying normalized match...');
    // Normalize whitespace for matching
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const normalizedOld = oldCode.replace(/\r\n/g, '\n');
    if (normalizedContent.includes(normalizedOld)) {
        const result = normalizedContent.replace(normalizedOld, newCode);
        fs.writeFileSync('aasw-pro/membership.html', result);
        console.log('SUCCESS: membership.html updated (normalized match)');
    } else {
        // Try even simpler match
        const simpleOld = "showToast('\uD83C\uDF89 Payment successful! Welcome to AASW.', 'success');";
        if (content.includes(simpleOld)) {
            content = content.replace(simpleOld, newCode);
            fs.writeFileSync('aasw-pro/membership.html', content);
            console.log('SUCCESS: membership.html updated (simple match)');
        } else {
            console.log('FAILED: Could not find the success toast.');
            // Attempt to find what's there
            const idx = content.indexOf('Payment successful');
            if (idx !== -1) {
                console.log('Found "Payment successful" at index', idx);
                console.log('Context:', content.substring(idx - 50, idx + 100));
            }
        }
    }
}

// Also fix views/membership.ejs if exists
if (fs.existsSync('views/membership.ejs')) {
    let ejsContent = fs.readFileSync('views/membership.ejs', 'utf8');
    const simpleOld2 = "showToast('\uD83C\uDF89 Payment successful! Welcome to AASW.', 'success');";
    if (ejsContent.includes(simpleOld2)) {
        ejsContent = ejsContent.replace(simpleOld2, newCode);
        fs.writeFileSync('views/membership.ejs', ejsContent);
        console.log('SUCCESS: views/membership.ejs also updated');
    }
}
