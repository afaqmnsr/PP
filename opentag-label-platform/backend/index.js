import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import bwipjs from 'bwip-js';

dotenv.config();
const app = express();

// Configure CORS with larger payload support
app.use(cors({
    origin: true,
    credentials: true,
    maxBodySize: '50mb'
}));

// Configure body parsers with large limits for image data
app.use(express.json({ 
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ 
    limit: '50mb', 
    extended: true 
}));

// Add error handling middleware for payload size errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 413) {
        return res.status(413).json({
            error: 'Payload too large',
            message: 'The image data is too large. Please try a smaller image or compress it.',
            maxSize: '50MB'
        });
    }
    next(error);
});

// Abstract PDF generation function to reuse between render and print
async function generateLabelPDF(doc, template) {
    // Scale factor: 1mm = 5px (same as frontend canvas)
    const scale = 5;
    
    for (const el of template.elements) {
        if (el.type === 'text') {
            doc.fontSize((el.fontSize || 10) * scale / 5).text(el.text || '', el.x * scale / 5, el.y * scale / 5);
        }
        if (el.type === 'qrcode') {
            try {
                // Generate QR code as data URL
                const qrDataUrl = await QRCode.toDataURL(el.data || '', {
                    width: el.size * scale / 5,
                    margin: 0,
                    color: {
                        dark: el.qrColor || '#000000',
                        light: el.backgroundColor || '#ffffff'
                    }
                });
                
                // Convert data URL to buffer for PDFKit
                const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                
                doc.image(buffer, el.x * scale / 5, el.y * scale / 5, { 
                    width: el.size * scale / 5, 
                    height: el.size * scale / 5 
                });
            } catch (error) {
                console.error('QR generation failed:', error);
                // Fallback to placeholder
                doc.rect(el.x * scale / 5, el.y * scale / 5, el.size * scale / 5, el.size * scale / 5).stroke();
                doc.text('QR', el.x * scale / 5 + 2, el.y * scale / 5 + 2);
            }
        }
        if (el.type === 'image') {
            try {
                // Handle base64 image data
                if (el.imageData) {
                    const base64Data = el.imageData.replace(/^data:image\/[^;]+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    doc.image(buffer, el.x * scale / 5, el.y * scale / 5, { 
                        width: (el.width || 20) * scale / 5, 
                        height: (el.height || 20) * scale / 5 
                    });
                } else if (el.imageUrl) {
                    // Handle image URL (for future implementation)
                    doc.image(el.imageUrl, el.x * scale / 5, el.y * scale / 5, { 
                        width: (el.width || 20) * scale / 5, 
                        height: (el.height || 20) * scale / 5 
                    });
                }
            } catch (error) {
                console.error('Image rendering failed:', error);
                // Fallback to placeholder
                doc.rect(el.x * scale / 5, el.y * scale / 5, (el.width || 20) * scale / 5, (el.height || 20) * scale / 5).stroke();
                doc.text('IMG', el.x * scale / 5 + 2, el.y * scale / 5 + 2);
            }
        }
        if (el.type === 'barcode') {
            try {
                // Generate barcode using bwip-js
                const barcodeBuffer = await bwipjs.toBuffer({
                    bcid: el.barcodeType || 'code128',
                    text: el.data || '',
                    scale: 3,
                    height: (el.height || 10) * scale / 5,
                    includetext: el.showText !== false,
                    textxalign: 'center',
                    textcolor: el.textColor || '#000000',
                    backgroundcolor: el.backgroundColor || '#ffffff'
                });
                
                doc.image(barcodeBuffer, el.x * scale / 5, el.y * scale / 5, { 
                    width: (el.width || 50) * scale / 5, 
                    height: (el.height || 10) * scale / 5 
                });
            } catch (error) {
                console.error('Barcode generation failed:', error);
                // Fallback to placeholder
                doc.rect(el.x * scale / 5, el.y * scale / 5, (el.width || 50) * scale / 5, (el.height || 10) * scale / 5).stroke();
                doc.text('BARCODE', el.x * scale / 5 + 2, el.y * scale / 5 + 2);
            }
        }
    }
}

app.post('/api/render/pdf', async (req, res) => {
    const template = req.body;

    // Create PDF with exact label dimensions, no margins
    const doc = new PDFDocument({ 
        size: [template.widthMm * 2.83, template.heightMm * 2.83], // mm to pt
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });
    
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="label.pdf"');
        res.send(pdfBuffer);
    });

    await generateLabelPDF(doc, template);
    doc.end();
});

// PrintNode integration
app.post('/api/print', async (req, res) => {
    try {
        const { template, printerId } = req.body;
        
        if (!process.env.PRINTNODE_API_KEY) {
            return res.status(500).json({ error: 'PrintNode API key not configured' });
        }

        // Generate PDF with exact dimensions
        const doc = new PDFDocument({ 
            size: [template.widthMm * 2.83, template.heightMm * 2.83],
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        await generateLabelPDF(doc, template);
        doc.end();

        const pdfBuffer = Buffer.concat(chunks);
        const base64 = pdfBuffer.toString('base64');

        // Send to PrintNode
        const response = await axios.post('https://api.printnode.com/printjobs', {
            printerId,
            title: 'Label Job',
            contentType: 'pdf_base64',
            content: base64
        }, {
            auth: { username: process.env.PRINTNODE_API_KEY, password: '' }
        });

        res.json({ success: true, jobId: response.data.id });
    } catch (error) {
        console.error('Print error:', error);
        res.status(500).json({ error: 'Print failed', details: error.message });
    }
});

// Get PrintNode printers
app.get('/api/printers', async (req, res) => {
    try {
        if (!process.env.PRINTNODE_API_KEY) {
            return res.status(500).json({ error: 'PrintNode API key not configured' });
        }

        const response = await axios.get('https://api.printnode.com/printers', {
            auth: { username: process.env.PRINTNODE_API_KEY, password: '' }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Failed to fetch printers:', error);
        res.status(500).json({ error: 'Failed to fetch printers', details: error.message });
    }
});

// Template management endpoints
app.get('/api/templates', (req, res) => {
    try {
        const templates = JSON.parse(fs.readFileSync('./shared/template.json', 'utf8'));
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load templates' });
    }
});

app.post('/api/templates', (req, res) => {
    try {
        const template = req.body;
        fs.writeFileSync('./shared/template.json', JSON.stringify(template, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save template' });
    }
});

app.delete('/api/templates/:name', (req, res) => {
    try {
        const templateName = decodeURIComponent(req.params.name);
        // For now, just return success since we're using a single template file
        // In a real app, you'd delete from a database or file system
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

// Print job history endpoint
app.get('/api/print-jobs', async (req, res) => {
    try {
        if (!process.env.PRINTNODE_API_KEY) {
            return res.status(500).json({ error: 'PrintNode API key not configured' });
        }

        const response = await axios.get('https://api.printnode.com/printjobs', {
            auth: { username: process.env.PRINTNODE_API_KEY, password: '' },
            params: { limit: 50 } // Get last 50 jobs
        });

        res.json(response.data);
    } catch (error) {
        console.error('Failed to fetch print jobs:', error);
        res.status(500).json({ error: 'Failed to fetch print jobs', details: error.message });
    }
});

// Brady printer profiles endpoint
app.get('/api/printer-profiles', (req, res) => {
    const profiles = [
        { name: "50x25mm", widthMm: 50, heightMm: 25, dpi: 300 },
        { name: "38x13mm", widthMm: 38, heightMm: 13, dpi: 300 },
        { name: "25x13mm", widthMm: 25, heightMm: 13, dpi: 300 }
    ];
    res.json(profiles);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
