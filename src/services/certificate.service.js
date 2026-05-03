const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

/**
 * Generates a PDF certificate by stamping text over the uploaded template image.
 * 
 * Template image: 2000 x 1414 pixels
 * pdf-lib coordinate system: Y=0 is BOTTOM, Y=1414 is TOP
 * 
 * Key positions (measured from original template):
 * - Name line: ~44% from top = ~56% from bottom
 * - Date line: ~18% from top = ~82% from bottom  
 * - Date is positioned at the right side (~87% from left)
 * 
 * @param {string} memberName - Full name of the new member
 * @param {string} membershipNo - The membership/payment ID
 * @param {string} membershipType - e.g. "1 Year" or "Lifetime"
 * @returns {Promise<Uint8Array>} - The generated PDF as a buffer
 */
async function generateCertificatePdf(memberName, membershipNo = '', membershipType = '1 Year') {
    try {
        const templatePath = path.join(__dirname, '../../aasw-pro/images/certificate-template.jpg');
        
        let templateBytes;
        let isPng = false;
        if (fs.existsSync(templatePath)) {
            templateBytes = fs.readFileSync(templatePath);
        } else {
            const pngPath = path.join(__dirname, '../../aasw-pro/images/certificate-template.png');
            if (fs.existsSync(pngPath)) {
                templateBytes = fs.readFileSync(pngPath);
                isPng = true;
            } else {
                throw new Error("Certificate template not found in aasw-pro/images/");
            }
        }
        
        const pdfDoc = await PDFDocument.create();
        const image = isPng ? await pdfDoc.embedPng(templateBytes) : await pdfDoc.embedJpg(templateBytes);
        
        const { width, height } = image.scale(1);
        // width = 2000, height = 1414
        const page = pdfDoc.addPage([width, height]);
        
        // Draw the background template
        page.drawImage(image, { x: 0, y: 0, width, height });
        
        // ─── 1. MEMBER NAME ───────────────────────────────────────────
        // Template: Name line is at ~50% from top = ~50% from bottom
        // Image height = 1414, so name line Y from bottom ≈ 1414 * 0.50 = 707
        // Text sits just ABOVE the line → Y = 670 (a few pts below center for alignment)
        const nameFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
        const nameSize = 48;
        
        // Auto-shrink font if name is very long to prevent overflow
        let finalNameSize = nameSize;
        let nameWidth = nameFont.widthOfTextAtSize(memberName, finalNameSize);
        const maxNameWidth = width * 0.55; // Max 55% of page width
        while (nameWidth > maxNameWidth && finalNameSize > 24) {
            finalNameSize -= 2;
            nameWidth = nameFont.widthOfTextAtSize(memberName, finalNameSize);
        }
        
        // Center horizontally
        const nameX = (width - nameWidth) / 2;
        // Name line in template is at Y≈707 from bottom.
        // Text baseline must be ABOVE this line → Y = 722 (draws text sitting on top of the line)
        const nameY = 722;
        
        page.drawText(memberName, {
            x: nameX,
            y: nameY,
            size: finalNameSize,
            font: nameFont,
            color: rgb(0.12, 0.12, 0.12),
        });
        
        // ─── 2. DATE OF ISSUE ─────────────────────────────────────────
        // Template: "DATE OF ISSUE" label is at top-right ~x=88%, y=32% from top
        // y=32% from top → y=68% from bottom → Y = 1414 * 0.68 = 961
        // Date value goes BELOW the label text → Y ≈ 935
        const dateFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const today = new Date();
        // Format: DD-MM-YYYY
        const dateStr = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
        
        const dateSize = 22;
        const dateWidth = dateFont.widthOfTextAtSize(dateStr, dateSize);
        
        // Center under the "DATE OF ISSUE" label at ~x=88%
        const dateCenterX = width * 0.875;
        const dateX = dateCenterX - (dateWidth / 2);
        const dateY = 935; // Just below the "DATE OF ISSUE" label text
        
        page.drawText(dateStr, {
            x: dateX,
            y: dateY,
            size: dateSize,
            font: dateFont,
            color: rgb(0.1, 0.1, 0.1)
        });
        
        // ─── 3. MEMBERSHIP ID ─────────────────────────────────────────
        // Template: "MEMBER ID" label is at top-left ~x=12%, y=32% from top
        // Member ID value goes BELOW the label → Y ≈ 935
        if (membershipNo) {
            const fontNo = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const noSize = 18;
            
            // Format the display ID — if it's already AASW-formatted, use as-is.
            // Only truncate raw Razorpay payment IDs (pay_xxxxx) for cleaner display.
            let displayId = membershipNo;
            if (!displayId.startsWith('AASW-') && displayId.length > 16) {
                // Convert raw Razorpay ID to AASW format
                const year = new Date().getFullYear();
                const shortId = displayId.slice(-5).toUpperCase();
                displayId = `AASW-${year}-${shortId}`;
            }
            
            // Line 1: The ID number
            const idText = displayId;
            const idWidth = fontNo.widthOfTextAtSize(idText, noSize);
            const memberIdCenterX = width * 0.125; // Center under "MEMBER ID" label at ~12%
            const idX = memberIdCenterX - (idWidth / 2);
            
            page.drawText(idText, {
                x: idX,
                y: 935, // Same row as date
                size: noSize,
                font: fontNo,
                color: rgb(0.1, 0.1, 0.1)
            });
            
            // Line 2: Membership Type just below the ID
            const typeFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const typeSize = 15;
            const typeText = `(${membershipType})`;
            const typeWidth = typeFont.widthOfTextAtSize(typeText, typeSize);
            const typeX = memberIdCenterX - (typeWidth / 2);
            
            page.drawText(typeText, {
                x: typeX,
                y: 912, // A line below the ID
                size: typeSize,
                font: typeFont,
                color: rgb(0.2, 0.2, 0.2)
            });
        }
        
        return await pdfDoc.save();
    } catch (error) {
        console.error("[Certificate Service] Error generating PDF:", error);
        throw error;
    }
}

module.exports = { generateCertificatePdf };
