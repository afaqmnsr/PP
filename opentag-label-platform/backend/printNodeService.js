import axios from 'axios';
import { fromByteArray } from 'base64-js';

const PRINTNODE_BASE_URL = 'https://api.printnode.com';

// Helper function for authenticated PrintNode API calls
async function makePrintNodeRequest(endpoint, options = {}) {
    const apiKey = process.env.PRINTNODE_API_KEY;
    
    if (!apiKey) {
        throw new Error('PrintNode API key not configured');
    }

    try {
        const response = await axios({
            url: `${PRINTNODE_BASE_URL}${endpoint}`,
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

export async function sendToPrintNode(pdfBuffer, printerId, printOptions = {}) {
    const pdfBase64 = fromByteArray(new Uint8Array(pdfBuffer));

    const printJob = {
        printerId: parseInt(printerId),
        title: printOptions.title || 'Label Print Job',
        contentType: 'pdf_base64',
        content: pdfBase64,
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

    try {
        const response = await makePrintNodeRequest('/printjobs', {
            method: 'POST',
            data: printJob
        });

        console.log(`Print job sent successfully! Job ID: ${response.id}`);
        return response;
    } catch (error) {
        console.error('Failed to send print job:', error);
        throw new Error(`Failed to send print job: ${error.message}`);
    }
}

export async function getPrinters() {
    return await makePrintNodeRequest('/printers');
}

export async function getPrinter(printerId) {
    return await makePrintNodeRequest(`/printers/${printerId}`);
}

export async function getPrinterCapabilities(printerId) {
    return await makePrintNodeRequest(`/printers/${printerId}/capabilities`);
}

export async function getPrintJobs(params = {}) {
    return await makePrintNodeRequest('/printjobs', { params });
}

export async function getPrintJob(jobId) {
    return await makePrintNodeRequest(`/printjobs/${jobId}`);
}

export async function cancelPrintJob(jobId) {
    return await makePrintNodeRequest(`/printjobs/${jobId}`, {
        method: 'DELETE'
    });
}

export async function getComputers() {
    return await makePrintNodeRequest('/computers');
}

export async function getComputer(computerId) {
    return await makePrintNodeRequest(`/computers/${computerId}`);
}

export async function getAccount() {
    return await makePrintNodeRequest('/account');
}

export async function getApiKeys() {
    return await makePrintNodeRequest('/account/apikeys');
}

export async function createApiKey(tag) {
    return await makePrintNodeRequest('/account/apikeys', {
        method: 'POST',
        data: { tag }
    });
}

export async function deleteApiKey(keyId) {
    return await makePrintNodeRequest(`/account/apikeys/${keyId}`, {
        method: 'DELETE'
    });
}

export async function getWebhooks() {
    return await makePrintNodeRequest('/account/webhooks');
}

export async function createWebhook(url, events) {
    return await makePrintNodeRequest('/account/webhooks', {
        method: 'POST',
        data: { url, events }
    });
}

export async function deleteWebhook(webhookId) {
    return await makePrintNodeRequest(`/account/webhooks/${webhookId}`, {
        method: 'DELETE'
    });
} 