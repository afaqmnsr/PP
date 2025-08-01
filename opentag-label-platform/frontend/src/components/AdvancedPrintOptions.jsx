import { useState, useEffect } from 'react';

export default function AdvancedPrintOptions({ onOptionsChange, selectedPrinter }) {
    const [printOptions, setPrintOptions] = useState({
        title: 'Label Print Job',
        source: 'OpenTag Label Platform',
        copies: 1,
        duplex: null,
        orientation: null,
        media: null,
        dpi: null,
        fitToPage: null,
        pageRange: null,
        ticket: null,
        expireAfter: null,
        qty: null,
        authentication: null,
        encryption: null
    });

    const [printerCapabilities, setPrinterCapabilities] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedPrinter) {
            loadPrinterCapabilities(selectedPrinter);
        }
    }, [selectedPrinter]);

    useEffect(() => {
        onOptionsChange(printOptions);
    }, [printOptions, onOptionsChange]);

    const loadPrinterCapabilities = async (printerId) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/api/printers/${printerId}/capabilities`);
            if (response.ok) {
                const capabilities = await response.json();
                setPrinterCapabilities(capabilities);
            }
        } catch (error) {
            console.error('Failed to load printer capabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOption = (key, value) => {
        setPrintOptions(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const getSupportedOptions = () => {
        if (!printerCapabilities) return {};

        return {
            duplex: printerCapabilities.duplex || [],
            orientation: printerCapabilities.orientation || [],
            media: printerCapabilities.media || [],
            dpi: printerCapabilities.dpi || []
        };
    };

    const supportedOptions = getSupportedOptions();

    return (
        <div className="advanced-print-options">
            <h3>Advanced Print Options</h3>
            
            {loading && (
                <div className="loading-message">
                    Loading printer capabilities...
                </div>
            )}

            <div className="options-grid">
                {/* Basic Options */}
                <div className="option-group">
                    <label>
                        <strong>Job Title:</strong>
                        <input
                            type="text"
                            value={printOptions.title}
                            onChange={(e) => updateOption('title', e.target.value)}
                            placeholder="Enter job title"
                        />
                    </label>
                </div>

                <div className="option-group">
                    <label>
                        <strong>Source:</strong>
                        <input
                            type="text"
                            value={printOptions.source}
                            onChange={(e) => updateOption('source', e.target.value)}
                            placeholder="Enter source"
                        />
                    </label>
                </div>

                <div className="option-group">
                    <label>
                        <strong>Copies:</strong>
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={printOptions.copies}
                            onChange={(e) => updateOption('copies', parseInt(e.target.value) || 1)}
                        />
                    </label>
                </div>

                {/* Duplex Options */}
                {supportedOptions.duplex.length > 0 && (
                    <div className="option-group">
                        <label>
                            <strong>Duplex:</strong>
                            <select
                                value={printOptions.duplex || ''}
                                onChange={(e) => updateOption('duplex', e.target.value || null)}
                            >
                                <option value="">Default</option>
                                {supportedOptions.duplex.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {/* Orientation Options */}
                {supportedOptions.orientation.length > 0 && (
                    <div className="option-group">
                        <label>
                            <strong>Orientation:</strong>
                            <select
                                value={printOptions.orientation || ''}
                                onChange={(e) => updateOption('orientation', e.target.value || null)}
                            >
                                <option value="">Default</option>
                                {supportedOptions.orientation.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {/* Media Options */}
                {supportedOptions.media.length > 0 && (
                    <div className="option-group">
                        <label>
                            <strong>Media Type:</strong>
                            <select
                                value={printOptions.media || ''}
                                onChange={(e) => updateOption('media', e.target.value || null)}
                            >
                                <option value="">Default</option>
                                {supportedOptions.media.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {/* DPI Options */}
                {supportedOptions.dpi.length > 0 && (
                    <div className="option-group">
                        <label>
                            <strong>DPI:</strong>
                            <select
                                value={printOptions.dpi || ''}
                                onChange={(e) => updateOption('dpi', e.target.value || null)}
                            >
                                <option value="">Default</option>
                                {supportedOptions.dpi.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                {/* Fit to Page */}
                <div className="option-group">
                    <label>
                        <strong>Fit to Page:</strong>
                        <select
                            value={printOptions.fitToPage || ''}
                            onChange={(e) => updateOption('fitToPage', e.target.value || null)}
                        >
                            <option value="">Default</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                        </select>
                    </label>
                </div>

                {/* Page Range */}
                <div className="option-group">
                    <label>
                        <strong>Page Range:</strong>
                        <input
                            type="text"
                            value={printOptions.pageRange || ''}
                            onChange={(e) => updateOption('pageRange', e.target.value || null)}
                            placeholder="e.g., 1-3, 5, 7-9"
                        />
                    </label>
                </div>

                {/* Quantity */}
                <div className="option-group">
                    <label>
                        <strong>Quantity:</strong>
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={printOptions.qty || ''}
                            onChange={(e) => updateOption('qty', parseInt(e.target.value) || null)}
                            placeholder="Number of labels"
                        />
                    </label>
                </div>

                {/* Expire After */}
                <div className="option-group">
                    <label>
                        <strong>Expire After (minutes):</strong>
                        <input
                            type="number"
                            min="1"
                            max="1440"
                            value={printOptions.expireAfter || ''}
                            onChange={(e) => updateOption('expireAfter', parseInt(e.target.value) || null)}
                            placeholder="Minutes (1-1440)"
                        />
                    </label>
                </div>

                {/* Authentication */}
                <div className="option-group">
                    <label>
                        <strong>Authentication:</strong>
                        <select
                            value={printOptions.authentication || ''}
                            onChange={(e) => updateOption('authentication', e.target.value || null)}
                        >
                            <option value="">None</option>
                            <option value="username">Username</option>
                            <option value="password">Password</option>
                            <option value="both">Both</option>
                        </select>
                    </label>
                </div>

                {/* Encryption */}
                <div className="option-group">
                    <label>
                        <strong>Encryption:</strong>
                        <select
                            value={printOptions.encryption || ''}
                            onChange={(e) => updateOption('encryption', e.target.value || null)}
                        >
                            <option value="">None</option>
                            <option value="ssl">SSL</option>
                            <option value="tls">TLS</option>
                        </select>
                    </label>
                </div>
            </div>

            {/* Print Ticket (Advanced) */}
            <div className="option-group full-width">
                <label>
                    <strong>Print Ticket (JSON):</strong>
                    <textarea
                        value={printOptions.ticket || ''}
                        onChange={(e) => updateOption('ticket', e.target.value || null)}
                        placeholder='{"key": "value"} - Advanced printer-specific options'
                        rows="3"
                    />
                </label>
            </div>

            {/* Reset Options */}
            <div className="options-actions">
                <button
                    onClick={() => {
                        setPrintOptions({
                            title: 'Label Print Job',
                            source: 'OpenTag Label Platform',
                            copies: 1,
                            duplex: null,
                            orientation: null,
                            media: null,
                            dpi: null,
                            fitToPage: null,
                            pageRange: null,
                            ticket: null,
                            expireAfter: null,
                            qty: null,
                            authentication: null,
                            encryption: null
                        });
                    }}
                    className="btn btn-secondary"
                >
                    Reset to Defaults
                </button>
            </div>

            {/* Current Options Summary */}
            <div className="options-summary">
                <h4>Current Options:</h4>
                <div className="summary-grid">
                    {Object.entries(printOptions).map(([key, value]) => {
                        if (value !== null && value !== '') {
                            return (
                                <div key={key} className="summary-item">
                                    <strong>{key}:</strong> {String(value)}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
} 