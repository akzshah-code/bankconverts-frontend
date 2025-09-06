import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { User } from './types';

export const generateInvoicePdfAsBase64 = async (
    user: User, 
    planName: string, 
    billingCycle: 'monthly' | 'annual',
    price: string,
): Promise<string> => {
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // --- Fetch and Embed Logo ---
    try {
        const logoUrl = '/Logo.png';
        const logoImageBytes = await fetch(logoUrl).then(res => res.arrayBuffer());
        const logoImage = await pdfDoc.embedPng(logoImageBytes);
        const logoDims = logoImage.scale(0.25);
        page.drawImage(logoImage, {
            x: 50,
            y: height - 50 - logoDims.height,
            width: logoDims.width,
            height: logoDims.height,
        });
    } catch (e) {
        console.error("Failed to load logo for PDF, proceeding without it.", e);
    }
    
    // --- Header ---
    page.drawText('BankConverts', { x: 120, y: height - 75, font: boldFont, size: 20, color: rgb(0.14, 0.4, 0.92) });
    page.drawText('Receipt of Purchase', { x: width - 200, y: height - 60, font: boldFont, size: 22 });
    page.drawText(`Date: ${new Date().toLocaleDateString('en-CA')}`, { x: width - 200, y: height - 80, font, size: 12 });
    const invoiceId = `INV-${Date.now()}`;
    page.drawText(`Receipt #: ${invoiceId}`, { x: width - 200, y: height - 100, font, size: 12 });

    // --- Bill To Section ---
    page.drawText('Bill To:', { x: 50, y: height - 150, font: boldFont, size: 12 });
    page.drawText(user.name, { x: 50, y: height - 165, font, size: 12 });
    page.drawText(user.email, { x: 50, y: height - 180, font, size: 12 });

    // --- Table Header ---
    const tableTop = height - 250;
    const tableRightEdgeX = width - 50; // The table rectangle's right edge is at x = 50 + (width - 100)
    const textRightEdgeX = tableRightEdgeX - 10; // Add 10px padding from the right edge for the text

    page.drawRectangle({
        x: 50, y: tableTop - 5, width: width - 100, height: 25,
        color: rgb(0.9, 0.9, 0.9)
    });
    page.drawText('Description', { x: 60, y: tableTop, font: boldFont, size: 12 });
    // FIX: Object literal may only specify known properties, and 'xTextAlign' does not exist in type 'PDFPageDrawTextOptions'. Right-align text manually.
    const priceHeaderText = 'Price';
    const priceHeaderTextWidth = boldFont.widthOfTextAtSize(priceHeaderText, 12);
    page.drawText(priceHeaderText, { x: textRightEdgeX - priceHeaderTextWidth, y: tableTop, font: boldFont, size: 12 });

    // --- Table Row ---
    const planDescription = `BankConverts - ${planName} Plan (${billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)})`;
    page.drawText(planDescription, { x: 60, y: tableTop - 30, font, size: 12 });
    // FIX: Object literal may only specify known properties, and 'xTextAlign' does not exist in type 'PDFPageDrawTextOptions'. Right-align text manually.
    const priceValueWidth = font.widthOfTextAtSize(price, 12);
    page.drawText(price, { x: textRightEdgeX - priceValueWidth, y: tableTop - 30, font, size: 12 });

    // --- Total ---
    page.drawLine({
        start: { x: width / 2, y: tableTop - 60 },
        end: { x: width - 50, y: tableTop - 60 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
    });
    page.drawText('Total', { x: width - 150, y: tableTop - 80, font: boldFont, size: 14 });
    // FIX: Object literal may only specify known properties, and 'xTextAlign' does not exist in type 'PDFPageDrawTextOptions'. Right-align text manually.
    const totalPriceWidth = boldFont.widthOfTextAtSize(price, 14);
    page.drawText(price, { x: textRightEdgeX - totalPriceWidth, y: tableTop - 80, font: boldFont, size: 14 });

    // --- Footer ---
    page.drawText('Thank you for your business!', { x: width / 2 - 100, y: 100, font, size: 14 });
    page.drawText('BankConverts.com', { x: width / 2 - 50, y: 80, font, size: 12, color: rgb(0.5, 0.5, 0.5) });

    const pdfBytes = await pdfDoc.save();
    
    // This conversion from Uint8Array to a base64 string is compatible with browser environments
    // and correctly handles the byte data to avoid the 'ArrayBufferLike' type error during build.
    let binary = '';
    const len = pdfBytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(pdfBytes[i]);
    }
    return window.btoa(binary);
};