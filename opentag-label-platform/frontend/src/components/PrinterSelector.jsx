import { useState, useEffect } from 'react';

export default function PrinterSelector({ selectedPrinter, onPrinterChange }) {
    const [printerProfiles, setPrinterProfiles] = useState([]);
    const [printers, setPrinters] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPrinterProfiles();
        loadPrinters();
    }, []);

    const loadPrinterProfiles = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/printer-profiles');
            if (response.ok) {
                const profiles = await response.json();
                setPrinterProfiles(profiles);
            }
        } catch (error) {
            console.error('Failed to load printer profiles:', error);
        }
    };

    const loadPrinters = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/printers');
            if (response.ok) {
                const printerData = await response.json();
                setPrinters(printerData);
            }
        } catch (error) {
            console.error('Failed to load printers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrinterSelect = (printerId) => {
        onPrinterChange(printerId);
    };

    const getPrinterStatus = (printer) => {
        if (printer.state === 'online') {
            return { status: 'online', label: 'Online', color: '#28a745' };
        } else if (printer.state === 'offline') {
            return { status: 'offline', label: 'Offline', color: '#dc3545' };
        } else {
            return { status: 'unknown', label: 'Unknown', color: '#6c757d' };
        }
    };

    return (
        <div className="printer-selector">
            <h3>Printer Management</h3>
            
            <div className="printer-controls">
                <button 
                    onClick={loadPrinters}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Printers'}
                </button>
            </div>

            <div className="printer-section">
                <h4>Label Size Profiles</h4>
                <div className="profile-grid">
                    {printerProfiles.map(profile => (
                        <div key={profile.name} className="profile-card">
                            <div className="profile-name">{profile.name}</div>
                            <div className="profile-size">
                                {profile.widthMm} × {profile.heightMm}mm
                            </div>
                            <div className="profile-dpi">{profile.dpi} DPI</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="printer-section">
                <h4>Available Printers</h4>
                {printers.length > 0 ? (
                    <div className="printer-list">
                        {printers.map(printer => {
                            const status = getPrinterStatus(printer);
                            return (
                                <div 
                                    key={printer.id} 
                                    className={`printer-item ${selectedPrinter === printer.id ? 'selected' : ''}`}
                                    onClick={() => handlePrinterSelect(printer.id)}
                                >
                                    <div className="printer-info">
                                        <div className="printer-name">{printer.name}</div>
                                        <div className="printer-location">{printer.location}</div>
                                    </div>
                                    <div className="printer-status">
                                        <span 
                                            className="status-indicator"
                                            style={{ backgroundColor: status.color }}
                                        />
                                        {status.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-printers">
                        {loading ? 'Loading printers...' : 'No printers found. Make sure PrintNode client is running.'}
                    </div>
                )}
            </div>

            {selectedPrinter && (
                <div className="selected-printer">
                    <h4>Selected Printer</h4>
                    <div className="selected-printer-info">
                        {printers.find(p => p.id === selectedPrinter)?.name || 'Unknown Printer'}
                    </div>
                </div>
            )}
        </div>
    );
} 