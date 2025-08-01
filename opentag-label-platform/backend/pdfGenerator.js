import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export async function generateLabelPDF(template, printOptions = {}) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create PDF document with label dimensions
            const doc = new PDFDocument({
                size: [template.widthMm * 2.83, template.heightMm * 2.83], // Convert mm to points
                margins: { top: 0, bottom: 0, left: 0, right: 0 }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(chunks);
                resolve(pdfBuffer);
            });

            // Scale factor: 1mm = 5px (same as frontend canvas)
            const scale = 5;
            
            // Render all elements
            for (const el of template.elements) {
                try {
                    switch (el.type) {
                        case 'text':
                            await renderTextElement(doc, el, scale);
                            break;

                        case 'qrcode':
                            await renderQRCodeElement(doc, el, scale);
                            break;

                        case 'barcode':
                            await renderBarcodeElement(doc, el, scale);
                            break;

                        case 'image':
                            await renderImageElement(doc, el, scale);
                            break;

                        case 'rectangle':
                            renderRectangleElement(doc, el, scale);
                            break;

                        case 'circle':
                            renderCircleElement(doc, el, scale);
                            break;

                        case 'line':
                            renderLineElement(doc, el, scale);
                            break;

                        default:
                            console.warn(`Unknown element type: ${el.type}`);
                    }
                } catch (error) {
                    console.error(`Error rendering element ${el.id}:`, error);
                }
            }

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
}

async function renderTextElement(doc, el, scale) {
    const fontSize = (el.fontSize || 10) * scale / 5;
    const textColor = el.textColor || '#000000';
    const backgroundColor = el.backgroundColor || '#ffffff';
    
    // Set font properties
    doc.fontSize(fontSize);
    doc.fillColor(textColor);
    
    // Handle text alignment
    const textOptions = {
        align: el.textAlign || 'left',
        width: (el.width || 50) * scale / 5
    };
    
    // Add background if specified
    if (backgroundColor !== '#ffffff') {
        doc.rect(el.x * scale / 5, el.y * scale / 5, textOptions.width, fontSize + 2)
           .fill(backgroundColor);
    }
    
    doc.text(el.text || '', el.x * scale / 5, el.y * scale / 5, textOptions);
}

async function renderQRCodeElement(doc, el, scale) {
    try {
        const qrDataUrl = await QRCode.toDataURL(el.data || '', {
            width: el.size * scale / 5,
            margin: 0,
            color: {
                dark: el.qrColor || '#000000',
                light: el.backgroundColor || '#ffffff'
            },
            errorCorrectionLevel: el.errorCorrectionLevel || 'M'
        });
        
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        doc.image(buffer, el.x * scale / 5, el.y * scale / 5, { 
            width: el.size * scale / 5, 
            height: el.size * scale / 5 
        });
    } catch (error) {
        console.error('QR generation failed:', error);
        // Fallback to placeholder
        doc.rect(el.x * scale / 5, el.y * scale / 5, el.size * scale / 5, el.size * scale / 5)
           .stroke('#ff0000')
           .fill('#ffcccc');
        doc.text('QR Error', el.x * scale / 5, el.y * scale / 5);
    }
}

async function renderBarcodeElement(doc, el, scale) {
    try {
        const barcodeOptions = {
            bcid: el.barcodeType || 'code128',
            text: el.data || '',
            scale: 2,
            height: el.height || 10,
            includetext: el.showText !== false,
            textxalign: 'center',
            width: el.width || 50
        };

        const barcodeBuffer = await bwipjs.toBuffer(barcodeOptions);
        
        doc.image(barcodeBuffer, el.x * scale / 5, el.y * scale / 5, {
            width: (el.width || 50) * scale / 5,
            height: (el.height || 10) * scale / 5
        });
    } catch (error) {
        console.error('Barcode generation failed:', error);
        // Fallback to placeholder
        doc.rect(el.x * scale / 5, el.y * scale / 5, (el.width || 50) * scale / 5, (el.height || 10) * scale / 5)
           .stroke('#ff0000')
           .fill('#ffcccc');
        doc.text('Barcode Error', el.x * scale / 5, el.y * scale / 5);
    }
}

async function renderImageElement(doc, el, scale) {
    try {
        if (el.imageData) {
            const base64Data = el.imageData.replace(/^data:image\/[^;]+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            
            doc.image(buffer, el.x * scale / 5, el.y * scale / 5, {
                width: (el.width || 50) * scale / 5,
                height: (el.height || 50) * scale / 5
            });
        }
    } catch (error) {
        console.error('Image rendering failed:', error);
        // Fallback to placeholder
        doc.rect(el.x * scale / 5, el.y * scale / 5, (el.width || 50) * scale / 5, (el.height || 50) * scale / 5)
           .stroke('#ff0000')
           .fill('#ffcccc');
        doc.text('IMG', el.x * scale / 5, el.y * scale / 5);
    }
}

function renderRectangleElement(doc, el, scale) {
    const fillColor = el.fillColor || '#ffffff';
    const strokeColor = el.strokeColor || '#000000';
    const strokeWidth = el.strokeWidth || 1;
    
    doc.rect(el.x * scale / 5, el.y * scale / 5, (el.width || 50) * scale / 5, (el.height || 30) * scale / 5)
       .fill(fillColor)
       .stroke(strokeColor, strokeWidth);
}

function renderCircleElement(doc, el, scale) {
    const fillColor = el.fillColor || '#ffffff';
    const strokeColor = el.strokeColor || '#000000';
    const strokeWidth = el.strokeWidth || 1;
    const radius = (el.radius || 25) * scale / 5;
    
    doc.circle(el.x * scale / 5 + radius, el.y * scale / 5 + radius, radius)
       .fill(fillColor)
       .stroke(strokeColor, strokeWidth);
}

function renderLineElement(doc, el, scale) {
    const strokeColor = el.strokeColor || '#000000';
    const strokeWidth = el.strokeWidth || 1;
    
    doc.moveTo(el.x * scale / 5, el.y * scale / 5)
       .lineTo((el.x + (el.width || 50)) * scale / 5, (el.y + (el.height || 0)) * scale / 5)
       .stroke(strokeColor, strokeWidth);
} 