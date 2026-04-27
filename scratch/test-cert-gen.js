const { generateCertificatePdf } = require('../src/services/certificate.service');
const fs = require('fs');

async function test() {
    try {
        // Test 1: Annual plan with normal name
        const buffer1 = await generateCertificatePdf('Rahul Sharma', 'pay_QXz9AbCdEfGhIj12', '1 Year');
        fs.writeFileSync('scratch/dummy-cert-annual.pdf', buffer1);
        console.log('✅ Generated: scratch/dummy-cert-annual.pdf');

        // Test 2: Lifetime plan with long name
        const buffer2 = await generateCertificatePdf('Smt. Priya Kumari Shrivastava', 'pay_QXz9AbCdEfGhIj34', 'Lifetime');
        fs.writeFileSync('scratch/dummy-cert-lifetime.pdf', buffer2);
        console.log('✅ Generated: scratch/dummy-cert-lifetime.pdf');
    } catch (err) {
        console.error('❌ Error:', err);
    }
}
test();

