import { useState, useEffect } from 'react';

export default function PrintNodeManager({ selectedPrinter, onSetDefaultPrinter }) {
    const [activeTab, setActiveTab] = useState('printers');
    const [printers, setPrinters] = useState([]);
    const [printJobs, setPrintJobs] = useState([]);
    const [computers, setComputers] = useState([]);
    const [account, setAccount] = useState(null);
    const [apiKeys, setApiKeys] = useState([]);
    const [webhooks, setWebhooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPrinterDetails, setSelectedPrinterDetails] = useState(null);
    const [printerCapabilities, setPrinterCapabilities] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        const loadDataSafely = async () => {
            if (!isMounted) return;
            
            setLoading(true);
            setError(null);
            try {
                await Promise.all([
                    loadPrinters(),
                    loadPrintJobs(),
                    loadComputers(),
                    loadAccount(),
                    loadApiKeys(),
                    loadWebhooks()
                ]);
            } catch (error) {
                if (isMounted) {
                    setError('Failed to load data: ' + error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        loadDataSafely();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const loadPrinters = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/printers');
            if (response.ok) {
                const data = await response.json();
                setPrinters(data);
            }
        } catch (error) {
            console.error('Failed to load printers:', error);
        }
    };

    const loadPrintJobs = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/print-jobs?limit=100');
            if (response.ok) {
                const data = await response.json();
                setPrintJobs(data);
            } else {
                const errorData = await response.json();
                if (errorData.details && errorData.details.includes('PrintNode API key not configured')) {
                    setError('PrintNode API key not configured. Please set PRINTNODE_API_KEY in your .env file.');
                } else {
                    setError(`Failed to load print jobs: ${errorData.error || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Failed to load print jobs:', error);
            setError('Failed to connect to server. Please ensure the backend is running.');
        }
    };

    const loadComputers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/computers');
            if (response.ok) {
                const data = await response.json();
                setComputers(data);
            }
        } catch (error) {
            console.error('Failed to load computers:', error);
        }
    };

    const loadAccount = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/account');
            if (response.ok) {
                const data = await response.json();
                setAccount(data);
            } else {
                const errorData = await response.json();
                if (errorData.details && errorData.details.includes('PrintNode API key not configured')) {
                    setError('PrintNode API key not configured. Please set PRINTNODE_API_KEY in your .env file.');
                } else {
                    setError(`Account info: ${errorData.message || errorData.error || 'Not available'}`);
                }
            }
        } catch (error) {
            console.error('Failed to load account:', error);
            setError('Failed to connect to server. Please ensure the backend is running.');
        }
    };

    const loadApiKeys = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/account/apikeys');
            if (response.ok) {
                const data = await response.json();
                setApiKeys(data);
            } else {
                const errorData = await response.json();
                if (errorData.details && errorData.details.includes('PrintNode API key not configured')) {
                    setError('PrintNode API key not configured. Please set PRINTNODE_API_KEY in your .env file.');
                } else {
                    setError(`API Keys: ${errorData.message || errorData.error || 'Not available'}`);
                }
            }
        } catch (error) {
            console.error('Failed to load API keys:', error);
            setError('Failed to connect to server. Please ensure the backend is running.');
        }
    };

    const loadWebhooks = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/account/webhooks');
            if (response.ok) {
                const data = await response.json();
                setWebhooks(data);
            } else {
                const errorData = await response.json();
                if (errorData.details && errorData.details.includes('PrintNode API key not configured')) {
                    setError('PrintNode API key not configured. Please set PRINTNODE_API_KEY in your .env file.');
                } else {
                    setError(`Webhooks: ${errorData.message || errorData.error || 'Not available'}`);
                }
            }
        } catch (error) {
            console.error('Failed to load webhooks:', error);
            setError('Failed to connect to server. Please ensure the backend is running.');
        }
    };

    const loadPrinterCapabilities = async (printerId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/printers/${printerId}/capabilities`);
            if (response.ok) {
                const data = await response.json();
                setPrinterCapabilities(data);
            }
        } catch (error) {
            console.error('Failed to load printer capabilities:', error);
        }
    };

    const cancelPrintJob = async (jobId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/print-jobs/${jobId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadPrintJobs(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to cancel print job:', error);
        }
    };

    const createApiKey = async (tag) => {
        try {
            const response = await fetch('http://localhost:3000/api/account/apikeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag })
            });
            if (response.ok) {
                await loadApiKeys();
            }
        } catch (error) {
            console.error('Failed to create API key:', error);
        }
    };

    const deleteApiKey = async (keyId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/account/apikeys/${keyId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadApiKeys();
            }
        } catch (error) {
            console.error('Failed to delete API key:', error);
        }
    };

    const createWebhook = async (url, events) => {
        try {
            const response = await fetch('http://localhost:3000/api/account/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, events })
            });
            if (response.ok) {
                await loadWebhooks();
            }
        } catch (error) {
            console.error('Failed to create webhook:', error);
        }
    };

    const deleteWebhook = async (webhookId) => {
        try {
            const response = await fetch(`http://localhost:3000/api/account/webhooks/${webhookId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await loadWebhooks();
            }
        } catch (error) {
            console.error('Failed to delete webhook:', error);
        }
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

    const getJobStatus = (job) => {
        if (job.state === 'complete') {
            return { status: 'complete', label: 'Completed', color: '#28a745' };
        } else if (job.state === 'failed') {
            return { status: 'failed', label: 'Failed', color: '#dc3545' };
        } else if (job.state === 'processing') {
            return { status: 'processing', label: 'Processing', color: '#ffc107' };
        } else {
            return { status: 'unknown', label: 'Unknown', color: '#6c757d' };
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleSetDefaultPrinter = (printer) => {
        if (onSetDefaultPrinter) {
            onSetDefaultPrinter(printer.id.toString());
        }
    };

    const renderPrinters = () => (
        <div className="printers-section">
            <div className="section-header">
                <h3>Printers ({printers.length})</h3>
                <button onClick={loadPrinters} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            <div className="printers-grid">
                {printers.map(printer => {
                    const status = getPrinterStatus(printer);
                    const isDefault = selectedPrinter === printer.id.toString();
                    return (
                        <div key={printer.id} className="printer-card">
                            <div className="printer-header">
                                <h4>{printer.name}</h4>
                                <div className="printer-badges">
                                    <span className="status-badge" style={{ backgroundColor: status.color }}>
                                        {status.label}
                                    </span>
                                    {isDefault && (
                                        <span className="default-badge" style={{ backgroundColor: '#007bff' }}>
                                            Default
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="printer-details">
                                <p><strong>ID:</strong> {printer.id}</p>
                                <p><strong>Location:</strong> {printer.location}</p>
                                <p><strong>Computer:</strong> {printer.computer?.name || 'Unknown'}</p>
                                <p><strong>Default:</strong> {printer.default ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="printer-actions">
                                <button 
                                    onClick={() => {
                                        setSelectedPrinterDetails(printer);
                                        loadPrinterCapabilities(printer.id);
                                    }}
                                    className="btn btn-sm btn-primary"
                                    style={{ marginRight: '5px' }}
                                >
                                    View Capabilities
                                </button>
                                {!isDefault && (
                                    <button 
                                        onClick={() => handleSetDefaultPrinter(printer)}
                                        className="btn btn-sm btn-success"
                                    >
                                        Set as Default
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedPrinterDetails && printerCapabilities && (
                <div className="capabilities-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4>Capabilities - {selectedPrinterDetails.name}</h4>
                            <button onClick={() => setSelectedPrinterDetails(null)} className="close-btn">×</button>
                        </div>
                        <div className="capabilities-content">
                            <pre>{JSON.stringify(printerCapabilities, null, 2)}</pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderPrintJobs = () => (
        <div className="print-jobs-section">
            <div className="section-header">
                <h3>Print Jobs ({printJobs.length})</h3>
                <button onClick={loadPrintJobs} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            <div className="jobs-list">
                {printJobs.map(job => {
                    const status = getJobStatus(job);
                    return (
                        <div key={job.id} className="job-card">
                            <div className="job-header">
                                <div className="job-title">
                                    <h4>{job.title}</h4>
                                    <span className="job-id">#{job.id}</span>
                                </div>
                                <div className="job-status">
                                    <span className="status-badge" style={{ backgroundColor: status.color }}>
                                        {status.label}
                                    </span>
                                    {job.state !== 'complete' && job.state !== 'failed' && (
                                        <button 
                                            onClick={() => cancelPrintJob(job.id)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="job-details">
                                <p><strong>Printer:</strong> {job.printer?.name || 'Unknown'}</p>
                                <p><strong>Created:</strong> {formatDate(job.createTimestamp)}</p>
                                {job.completeTimestamp && (
                                    <p><strong>Completed:</strong> {formatDate(job.completeTimestamp)}</p>
                                )}
                                {job.copies && <p><strong>Copies:</strong> {job.copies}</p>}
                                {job.source && <p><strong>Source:</strong> {job.source}</p>}
                            </div>
                            {job.state === 'failed' && job.error && (
                                <div className="job-error">
                                    <strong>Error:</strong> {job.error}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderComputers = () => (
        <div className="computers-section">
            <div className="section-header">
                <h3>Computers ({computers.length})</h3>
                <button onClick={loadComputers} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            <div className="computers-grid">
                {computers.map(computer => (
                    <div key={computer.id} className="computer-card">
                        <div className="computer-header">
                            <h4>{computer.name}</h4>
                            <span className="status-badge" style={{ 
                                backgroundColor: computer.state === 'online' ? '#28a745' : '#dc3545' 
                            }}>
                                {computer.state}
                            </span>
                        </div>
                        <div className="computer-details">
                            <p><strong>ID:</strong> {computer.id}</p>
                            <p><strong>Hostname:</strong> {computer.hostname}</p>
                            <p><strong>Account:</strong> {computer.account}</p>
                            <p><strong>Version:</strong> {computer.version}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAccount = () => (
        <div className="account-section">
            <div className="section-header">
                <h3>Account Information</h3>
                <button onClick={loadAccount} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            {account && (
                <div className="account-card">
                    {account.message ? (
                        <div className="account-notice">
                            <p><strong>Note:</strong> {account.message}</p>
                            {account.note && <p>{account.note}</p>}
                            {account.availableEndpoints && (
                                <div>
                                    <p><strong>Available Endpoints:</strong></p>
                                    <ul>
                                        {account.availableEndpoints.map(endpoint => (
                                            <li key={endpoint}>{endpoint}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="account-details">
                            <p><strong>ID:</strong> {account.id}</p>
                            <p><strong>First Name:</strong> {account.firstname}</p>
                            <p><strong>Last Name:</strong> {account.lastname}</p>
                            <p><strong>Email:</strong> {account.email}</p>
                            <p><strong>Created:</strong> {formatDate(account.created)}</p>
                            <p><strong>Modified:</strong> {formatDate(account.modified)}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderApiKeys = () => (
        <div className="api-keys-section">
            <div className="section-header">
                <h3>API Keys</h3>
                <button onClick={loadApiKeys} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            {apiKeys.length > 0 ? (
                <div className="api-keys-list">
                    {apiKeys.map(apiKey => (
                        <div key={apiKey.id} className="api-key-card">
                            <div className="api-key-header">
                                <div className="api-key-info">
                                    <h4>{apiKey.tag || 'Untitled Key'}</h4>
                                    <span className="api-key-id">ID: {apiKey.id}</span>
                                </div>
                                <button 
                                    onClick={() => deleteApiKey(apiKey.id)}
                                    className="btn btn-sm btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="api-key-details">
                                <p><strong>Created:</strong> {formatDate(apiKey.created)}</p>
                                <p><strong>Last Used:</strong> {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="api-keys-notice">
                    <p><strong>API Key Management Not Available</strong></p>
                    <p>API key management requires parent account authentication and is not available via API key authentication.</p>
                    <p>Please manage your API keys through the PrintNode web interface:</p>
                    <a href="https://app.printnode.com/account/apikeys" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        Manage API Keys
                    </a>
                </div>
            )}
        </div>
    );

    const renderWebhooks = () => (
        <div className="webhooks-section">
            <div className="section-header">
                <h3>Webhooks</h3>
                <button onClick={loadWebhooks} className="btn btn-secondary" disabled={loading}>
                    Refresh
                </button>
            </div>
            
            {webhooks.length > 0 ? (
                <div className="webhooks-list">
                    {webhooks.map(webhook => (
                        <div key={webhook.id} className="webhook-card">
                            <div className="webhook-header">
                                <div className="webhook-info">
                                    <h4>{webhook.url}</h4>
                                    <span className="webhook-id">ID: {webhook.id}</span>
                                </div>
                                <button 
                                    onClick={() => deleteWebhook(webhook.id)}
                                    className="btn btn-sm btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                            <div className="webhook-details">
                                <p><strong>Events:</strong> {webhook.events.join(', ')}</p>
                                <p><strong>Created:</strong> {formatDate(webhook.created)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="webhooks-notice">
                    <p><strong>Webhook Management Not Available</strong></p>
                    <p>Webhook endpoints are not available in the current PrintNode API.</p>
                    <p>Please check the PrintNode documentation for webhook support.</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="printnode-manager">
            <div className="manager-header">
                <h2>PrintNode Management</h2>
                <button onClick={() => {
                    setLoading(true);
                    setError(null);
                    Promise.all([
                        loadPrinters(),
                        loadPrintJobs(),
                        loadComputers(),
                        loadAccount(),
                        loadApiKeys(),
                        loadWebhooks()
                    ]).finally(() => setLoading(false));
                }} className="btn btn-primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh All'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    {error.includes('PrintNode API key not configured') && (
                        <div className="setup-instructions">
                            <h4>Setup Instructions:</h4>
                            <ol>
                                <li>Go to <a href="https://app.printnode.com/account/apikeys" target="_blank" rel="noopener noreferrer">PrintNode API Keys</a></li>
                                <li>Create a new API key</li>
                                <li>Create a <code>.env</code> file in the <code>backend</code> directory</li>
                                <li>Add: <code>PRINTNODE_API_KEY=your_api_key_here</code></li>
                                <li>Restart the backend server</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}

            <div className="manager-tabs">
                <button 
                    className={`tab-btn ${activeTab === 'printers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('printers')}
                >
                    Printers
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    Print Jobs
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'computers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('computers')}
                >
                    Computers
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    Account
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'apikeys' ? 'active' : ''}`}
                    onClick={() => setActiveTab('apikeys')}
                >
                    API Keys
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'webhooks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('webhooks')}
                >
                    Webhooks
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'printers' && renderPrinters()}
                {activeTab === 'jobs' && renderPrintJobs()}
                {activeTab === 'computers' && renderComputers()}
                {activeTab === 'account' && renderAccount()}
                {activeTab === 'apikeys' && renderApiKeys()}
                {activeTab === 'webhooks' && renderWebhooks()}
            </div>
        </div>
    );
} 