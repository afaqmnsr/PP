import { useState, useEffect } from 'react';

export default function PrintPreview({ template, isOpen, onClose }) {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (isOpen && template) {
            generatePreview();
        }
        
        // Cleanup PDF URL when component unmounts or modal closes
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [isOpen, template]);

    const generatePreview = async () => {
        setLoading(true);
        setError(null);
        
        // Cleanup previous PDF URL
        if (pdfUrl) {
            window.URL.revokeObjectURL(pdfUrl);
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/render/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } else {
                setError('Failed to generate PDF preview');
            }
        } catch (error) {
            setError('Failed to generate PDF preview: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${template.name || 'label'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleZoomReset = () => {
        setZoom(1);
    };

    if (!isOpen) return null;

    return (
        <div className="print-preview-overlay">
            <div className="print-preview-modal">
                <div className="print-preview-header">
                    <h3>Print Preview - {template.name}</h3>
                    <div className="print-preview-actions">
                        <div className="zoom-controls">
                            <button 
                                onClick={handleZoomOut}
                                className="btn btn-sm btn-secondary"
                                disabled={zoom <= 0.25}
                            >
                                -
                            </button>
                            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
                            <button 
                                onClick={handleZoomIn}
                                className="btn btn-sm btn-secondary"
                                disabled={zoom >= 3}
                            >
                                +
                            </button>
                            <button 
                                onClick={handleZoomReset}
                                className="btn btn-sm btn-secondary"
                            >
                                Reset
                            </button>
                        </div>
                        <button 
                            onClick={handleDownload}
                            className="btn btn-secondary"
                            disabled={!pdfUrl}
                        >
                            Download PDF
                        </button>
                        <button 
                            onClick={onClose}
                            className="btn btn-primary"
                        >
                            Close
                        </button>
                    </div>
                </div>
                
                <div className="print-preview-content">
                    {loading && (
                        <div className="print-preview-loading">
                            <div className="loading-spinner"></div>
                            <p>Generating PDF preview...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="print-preview-error">
                            <p>{error}</p>
                            <button 
                                onClick={generatePreview}
                                className="btn btn-secondary"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    
                    {pdfUrl && !loading && (
                        <div className="pdf-container" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                            <iframe
                                src={pdfUrl}
                                title="PDF Preview"
                                className="print-preview-iframe"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 