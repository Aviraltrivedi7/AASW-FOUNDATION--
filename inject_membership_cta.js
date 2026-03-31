const fs = require('fs');

let html = fs.readFileSync('aasw-pro/index.html', 'utf8');

const cta = [
  '<section style="background:linear-gradient(135deg,#0f3460 0%,#1a73e8 60%,#0e7490 100%);padding:80px 20px;text-align:center">',
  '<div style="max-width:700px;margin:0 auto">',
  '<p style="display:inline-block;background:rgba(255,255,255,0.15);color:#fff;border-radius:20px;padding:6px 18px;font-size:.8rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px">Join The Movement</p>',
  '<h2 style="font-family:Montserrat,sans-serif;font-size:clamp(2rem,5vw,2.8rem);font-weight:800;color:#fff;margin-bottom:16px">Become an AASW Foundation Member</h2>',
  '<p style="color:rgba(255,255,255,.85);font-size:1.05rem;line-height:1.7;max-width:560px;margin:0 auto 36px">',
  'Choose a membership plan that fits your passion. Support education, health, and livelihoods across rural India. All memberships are 80G tax-exempt.',
  '</p>',
  '<div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin-bottom:36px">',
  '<div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:16px 24px;color:#fff;min-width:155px">',
  '<div style="font-size:1.6rem;font-weight:800;font-family:Montserrat,sans-serif">&#8377;500</div>',
  '<div style="font-size:.85rem;opacity:.85">Saathi / year</div></div>',
  '<div style="background:rgba(255,255,255,.22);border:2px solid rgba(255,255,255,.5);border-radius:12px;padding:16px 24px;color:#fff;min-width:155px;position:relative">',
  '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#f59e0b;border-radius:20px;font-size:.7rem;font-weight:700;padding:3px 10px;text-transform:uppercase;white-space:nowrap">Most Popular</div>',
  '<div style="font-size:1.6rem;font-weight:800;font-family:Montserrat,sans-serif">&#8377;1,500</div>',
  '<div style="font-size:.85rem;opacity:.85">Sevak / year</div></div>',
  '<div style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);border-radius:12px;padding:16px 24px;color:#fff;min-width:155px">',
  '<div style="font-size:1.6rem;font-weight:800;font-family:Montserrat,sans-serif">&#8377;5,000</div>',
  '<div style="font-size:.85rem;opacity:.85">Patron / year</div></div>',
  '</div>',
  '<a href="/membership.html" style="display:inline-flex;align-items:center;gap:10px;background:#fff;color:#1a73e8;text-decoration:none;font-family:Montserrat,sans-serif;font-size:1rem;font-weight:800;padding:16px 40px;border-radius:50px;box-shadow:0 8px 24px rgba(0,0,0,.25)">',
  'Become a Member',
  '</a></div></section>'
].join('');

// Find contact section and inject before it
const idx = html.indexOf('id="contact"');
if (idx !== -1) {
  // Find the start of this section element
  let sectionStart = idx;
  while (sectionStart > 0 && html[sectionStart] !== '<') sectionStart--;
  html = html.slice(0, sectionStart) + cta + html.slice(sectionStart);
  fs.writeFileSync('aasw-pro/index.html', html);
  console.log('SUCCESS: Membership CTA injected before contact section');
} else {
  console.log('ERROR: Could not find contact section. File length:', html.length);
}
