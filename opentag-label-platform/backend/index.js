import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/render/pdf', (req, res) => {
    const template = req.body;

    const doc = new PDFDocument({ size: [template.widthMm * 2.83, template.heightMm * 2.83] }); // mm to pt
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);
    });

    for (const el of template.elements) {
        if (el.type === 'text') {
            doc.fontSize(el.fontSize || 10).text(el.text || '', el.x, el.y);
        }
        if (el.type === 'qrcode') {
            // Add QR support later with library
            doc.rect(el.x, el.y, el.size, el.size).stroke();
            doc.text('QR', el.x + 2, el.y + 2); // placeholder
        }
    }

    doc.end();
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
