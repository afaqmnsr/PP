import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import axios from 'axios';
import bwipjs from 'bwip-js';
import { addLabelToQueue, getQueueStatus, clearQueue } from './queueManager.js';
import { generateLabelPDF } from './pdfGenerator.js';
import { 
    sendToPrintNode, 
    getPrinters, 
    getPrinter, 
    getPrinterCapabilities,
    getPrintJobs,
    getPrintJob,
    cancelPrintJob,
    getComputers,
    getComputer,
    getAccount,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    getWebhooks,
    createWebhook,
    deleteWebhook
} from './printNodeService.js';

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

// Legacy helper function for PrintNode requests (kept for backward compatibility)
async function makePrintNodeRequest(endpoint, options = {}) {
    const apiKey = process.env.PRINTNODE_API_KEY;
    
    if (!apiKey) {
        throw new Error('PrintNode API key not configured');
    }

    try {
        const response = await axios({
            url: `https://api.printnode.com${endpoint}`,
            method: options.method || 'GET',
            auth: {
                username: apiKey,
                password: ''
            },
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            params: options.params,
            data: options.data
        });

        return response.data;
    } catch (error) {
        console.error('PrintNode API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
}

// API Routes

// Render PDF endpoint (for preview)
app.post('/api/render-pdf', async (req, res) => {
    try {
        const { template } = req.body;
        
        if (!template) {
            return res.status(400).json({ error: 'Template is required' });
        }

        const pdfBuffer = await generateLabelPDF(template);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="label.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ 
            error: 'PDF generation failed', 
            details: error.message 
        });
    }
});

// Print endpoint with queue support
app.post('/api/print', async (req, res) => {
    try {
        const { template, printerId, printOptions = {}, useQueue = true } = req.body;
        
        if (!template || !printerId) {
            return res.status(400).json({ 
                error: 'Template and printerId are required' 
            });
        }

        // If queue is enabled, add to queue
        if (useQueue) {
            return await addLabelToQueue(template, printerId, printOptions, res);
        }

        // Otherwise, print immediately (legacy behavior)
        const pdfBuffer = await generateLabelPDF(template);
        const base64 = pdfBuffer.toString('base64');

        // Prepare print job with advanced options
        const printJob = {
            printerId: parseInt(printerId),
            title: printOptions.title || 'Label Print Job',
            contentType: 'pdf_base64',
            content: base64,
            source: printOptions.source || 'OpenTag Label Platform',
            // Advanced options
            ...(printOptions.copies && { copies: printOptions.copies }),
            ...(printOptions.duplex && { duplex: printOptions.duplex }),
            ...(printOptions.orientation && { orientation: printOptions.orientation }),
            ...(printOptions.media && { media: printOptions.media }),
            ...(printOptions.dpi && { dpi: printOptions.dpi }),
            ...(printOptions.fitToPage && { fitToPage: printOptions.fitToPage }),
            ...(printOptions.pageRange && { pageRange: printOptions.pageRange }),
            ...(printOptions.ticket && { ticket: printOptions.ticket }),
            ...(printOptions.expireAfter && { expireAfter: printOptions.expireAfter }),
            ...(printOptions.qty && { qty: printOptions.qty }),
            ...(printOptions.authentication && { authentication: printOptions.authentication }),
            ...(printOptions.encryption && { encryption: printOptions.encryption })
        };

        // Send to PrintNode
        const response = await makePrintNodeRequest('/printjobs', {
            method: 'POST',
            data: printJob
        });

        res.json({ 
            success: true, 
            jobId: response.id,
            job: response
        });
    } catch (error) {
        console.error('Print error:', error);
        res.status(500).json({ 
            error: 'Print failed', 
            details: error.message,
            code: error.response?.status 
        });
    }
});

// Queue management endpoints
app.get('/api/queue/status', (req, res) => {
    const status = getQueueStatus();
    res.json(status);
});

app.post('/api/queue/clear', (req, res) => {
    clearQueue();
    res.json({ success: true, message: 'Queue cleared' });
});

// PrintNode API proxy endpoints (using new service)
app.get('/api/printers', async (req, res) => {
    try {
        const printers = await getPrinters();
        res.json(printers);
    } catch (error) {
        console.error('Failed to fetch printers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch printers', 
            details: error.message 
        });
    }
});

app.get('/api/printers/:id', async (req, res) => {
    try {
        const printer = await getPrinter(req.params.id);
        res.json(printer);
    } catch (error) {
        console.error('Failed to fetch printer:', error);
        res.status(500).json({ 
            error: 'Failed to fetch printer', 
            details: error.message 
        });
    }
});

app.get('/api/printers/:id/capabilities', async (req, res) => {
    try {
        const capabilities = await getPrinterCapabilities(req.params.id);
        res.json(capabilities);
    } catch (error) {
        console.error('Failed to fetch printer capabilities:', error);
        res.status(500).json({ 
            error: 'Failed to fetch printer capabilities', 
            details: error.message 
        });
    }
});

// Get print jobs with filtering and pagination
app.get('/api/print-jobs', async (req, res) => {
    try {
        const { limit, after, dir, printer, state, dateFrom, dateTo } = req.query;
        const params = {};
        
        if (limit) params.limit = parseInt(limit);
        if (after) params.after = parseInt(after);
        if (dir) params.dir = dir;
        if (printer) params.printer = parseInt(printer);
        if (state) params.state = state;
        if (dateFrom) params.dateFrom = dateFrom;
        if (dateTo) params.dateTo = dateTo;

        const printJobs = await getPrintJobs(params);
        res.json(printJobs);
    } catch (error) {
        console.error('Failed to fetch print jobs:', error);
        res.status(500).json({ 
            error: 'Failed to fetch print jobs', 
            details: error.message,
            code: error.response?.status 
        });
    }
});

// Get specific print job by ID
app.get('/api/print-jobs/:id', async (req, res) => {
    try {
        const job = await getPrintJob(req.params.id);
        res.json(job);
    } catch (error) {
        console.error('Failed to fetch print job:', error);
        res.status(500).json({ 
            error: 'Failed to fetch print job', 
            details: error.message 
        });
    }
});

// Cancel a print job
app.delete('/api/print-jobs/:id', async (req, res) => {
    try {
        await cancelPrintJob(req.params.id);
        res.json({ success: true, message: 'Print job cancelled successfully' });
    } catch (error) {
        console.error('Failed to cancel print job:', error);
        res.status(500).json({ 
            error: 'Failed to cancel print job', 
            details: error.message 
        });
    }
});

app.get('/api/computers', async (req, res) => {
    try {
        const computers = await getComputers();
        res.json(computers);
    } catch (error) {
        console.error('Failed to fetch computers:', error);
        res.status(500).json({ 
            error: 'Failed to fetch computers', 
            details: error.message 
        });
    }
});

app.get('/api/computers/:id', async (req, res) => {
    try {
        const computer = await getComputer(req.params.id);
        res.json(computer);
    } catch (error) {
        console.error('Failed to fetch computer:', error);
        res.status(500).json({ 
            error: 'Failed to fetch computer', 
            details: error.message 
        });
    }
});

// Get account information (mock response)
app.get('/api/account', async (req, res) => {
    res.json({
        message: 'Account information not available via API key authentication',
        note: 'Account management requires parent account authentication or web interface access',
        availableEndpoints: ['/api/printers', '/api/computers', '/api/print-jobs']
    });
});

// Get API keys for the account (not available via API)
app.get('/api/account/apikeys', async (req, res) => {
    res.status(403).json({
        error: 'API key management not available',
        message: 'API key management requires parent account authentication',
        note: 'Please manage API keys through the PrintNode web interface at https://app.printnode.com/account/apikeys'
    });
});

// Get webhook information (not available via API)
app.get('/api/account/webhooks', async (req, res) => {
    res.status(404).json({
        error: 'Webhook management not available',
        message: 'Webhook endpoints are not available in the current PrintNode API',
        note: 'Please check PrintNode documentation for webhook support'
    });
});

// Template management endpoints
app.get('/api/templates', (req, res) => {
    try {
        const templatesDir = './templates';
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }
        
        const files = fs.readdirSync(templatesDir);
        const templates = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const content = fs.readFileSync(`${templatesDir}/${file}`, 'utf8');
                return JSON.parse(content);
            });
        
        res.json(templates);
    } catch (error) {
        console.error('Failed to load templates:', error);
        res.status(500).json({ 
            error: 'Failed to load templates', 
            details: error.message 
        });
    }
});

app.post('/api/templates', (req, res) => {
    try {
        const { template } = req.body;
        
        if (!template || !template.name) {
            return res.status(400).json({ 
                error: 'Template with name is required' 
            });
        }

        const templatesDir = './templates';
        if (!fs.existsSync(templatesDir)) {
            fs.mkdirSync(templatesDir, { recursive: true });
        }

        const filename = `${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        const filepath = `${templatesDir}/${filename}`;
        
        fs.writeFileSync(filepath, JSON.stringify(template, null, 2));
        
        res.json({ 
            success: true, 
            message: 'Template saved successfully',
            filename 
        });
    } catch (error) {
        console.error('Failed to save template:', error);
        res.status(500).json({ 
            error: 'Failed to save template', 
            details: error.message 
        });
    }
});

// Printer profiles endpoint
app.get('/api/printer-profiles', (req, res) => {
    const profiles = [
        { name: 'Default Printer', id: 1 },
        { name: 'Label Printer 1', id: 2 },
        { name: 'Label Printer 2', id: 3 }
    ];
    res.json(profiles);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Queue system enabled with 3-second debounce`);
});
