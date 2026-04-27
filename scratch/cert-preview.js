/**
 * Visual preview of certificate positioning
 * Uses sharp to overlay text onto template image → saves PNG
 * This mirrors exact coordinates used in certificate.service.js
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const templatePath = path.join('aasw-pro', 'images', 'certificate-template.jpg');

// Image is 2000x1414. pdf-lib Y=0 is BOTTOM.
// In SVG/image coordinates: Y_image = height - Y_pdf
// height = 1414

function pdfYtoImg(pdfY) {
    return 1414 - pdfY;
}

// ---- These match certificate.service.js ----
const nameY_pdf = 670;       // name
const dateY_pdf = 935;       // date
const memberIdY_pdf = 935;   // member ID line 1
const memberTypeY_pdf = 912; // member type line 2

// Convert to image coordinates
const nameY_img = pdfYtoImg(nameY_pdf);       // 744
const dateY_img = pdfYtoImg(dateY_pdf);       // 479
const memberIdY_img = pdfYtoImg(memberIdY_pdf);   // 479
const memberTypeY_img = pdfYtoImg(memberTypeY_pdf); // 502

// Member ID: center at x=12.5% = 250, Date: center at x=87.5% = 1750
const memberIdCenterX = 250;
const dateCenterX = 1750;

const memberName = 'Rahul Sharma';
const memberId = 'AbCdEfGhIj12'; // last 14 chars of razorpay ID
const dateStr = '21-04-2026';
const membershipType = '1 Year';

// SVG overlay with text positioned at exact coordinates
const svgOverlay = `
<svg width="2000" height="1414" xmlns="http://www.w3.org/2000/svg">
  <!-- Name - centered, italic, Times New Roman style -->
  <text x="1000" y="${nameY_img}" 
        font-family="Georgia, serif" font-style="italic" font-size="48" 
        fill="#1f1f1f" text-anchor="middle">${memberName}</text>
  
  <!-- Date - bold Helvetica, right side -->
  <text x="${dateCenterX}" y="${dateY_img}" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="22" 
        fill="#1a1a1a" text-anchor="middle">${dateStr}</text>
  
  <!-- Member ID - left side, line 1 -->
  <text x="${memberIdCenterX}" y="${memberIdY_img}" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="18" 
        fill="#1a1a1a" text-anchor="middle">${memberId}</text>

  <!-- Member Type - left side, line 2 -->
  <text x="${memberIdCenterX}" y="${memberTypeY_img}" 
        font-family="Arial, sans-serif" font-size="15" 
        fill="#333333" text-anchor="middle">(${membershipType})</text>
        
  <!-- Debug guide lines (light red) -->
  <line x1="0" y1="${nameY_img}" x2="2000" y2="${nameY_img}" stroke="rgba(255,0,0,0.2)" stroke-width="1"/>
  <line x1="0" y1="${dateY_img}" x2="2000" y2="${dateY_img}" stroke="rgba(0,0,255,0.2)" stroke-width="1"/>
</svg>`;

sharp(templatePath)
    .composite([{
        input: Buffer.from(svgOverlay),
        top: 0,
        left: 0
    }])
    .png()
    .toFile('scratch/cert-preview.png')
    .then(() => {
        console.log('✅ Preview saved to scratch/cert-preview.png');
        console.log(`   Name Y (image): ${nameY_img} (pdf: ${nameY_pdf})`);
        console.log(`   Date Y (image): ${dateY_img} (pdf: ${dateY_pdf})`);
        console.log(`   MemberID center X: ${memberIdCenterX} (12.5% of 2000)`);
        console.log(`   Date center X: ${dateCenterX} (87.5% of 2000)`);
    })
    .catch(err => console.error('❌ Error:', err));
