import { generateLabelPDF } from './pdfGenerator.js';
import { sendToPrintNode } from './printNodeService.js';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const labelQueue = [];
let timer = null;
const debounceTime = 3000; // 3 seconds debounce

export async function addLabelToQueue(template, printerId, printOptions, res) {
    labelQueue.push({ template, printerId, printOptions });
    console.log(`Label added to queue. Total in queue: ${labelQueue.length}`);

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
        console.log(`Debounce timeout reached. Processing ${labelQueue.length} labels...`);
        await processQueue();
    }, debounceTime);

    return res.status(200).json({
        success: true,
        message: `Label added to batch queue! (${labelQueue.length} labels pending)`,
        queueSize: labelQueue.length
    });
}

async function processQueue() {
    if (labelQueue.length === 0) {
        console.log("No labels to process.");
        return;
    }

    console.log(`Processing ${labelQueue.length} labels for printing...`);

    try {
        const pdfBuffers = [];

        for (const { template, printOptions } of labelQueue) {
            const pdfBuffer = await generateLabelPDF(template, printOptions);
            pdfBuffers.push(pdfBuffer);
        }

        // Merge all PDFs into a single document
        const mergedPdfBuffer = await mergePDFBuffers(pdfBuffers);

        // Send the merged PDF to PrintNode
        const { printerId, printOptions } = labelQueue[0]; // Use first item's printer and options
        await sendToPrintNode(mergedPdfBuffer, printerId, printOptions);

        // Clear queue after successful printing
        labelQueue.length = 0;
        console.log("Batch printed and queue cleared.");

    } catch (error) {
        console.error('Error processing queue:', error);
        // Don't clear queue on error - let it retry
    }
}

async function mergePDFBuffers(buffers) {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of buffers) {
        const pdf = await PDFDocument.load(buffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBuffer = await mergedPdf.save();
    return mergedPdfBuffer;
}

export function getQueueStatus() {
    return {
        queueSize: labelQueue.length,
        isProcessing: timer !== null
    };
}

export function clearQueue() {
    labelQueue.length = 0;
    if (timer) {
        clearTimeout(timer);
        timer = null;
    }
    console.log("Queue cleared manually.");
} 