import { useState, useEffect } from 'react';

export default function PrintJobHistory() {
    const [printJobs, setPrintJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPrintJobs();
    }, []);

    const loadPrintJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3000/api/print-jobs');
            if (response.ok) {
                const jobs = await response.json();
                setPrintJobs(jobs);
            } else {
                setError('Failed to load print jobs');
            }
        } catch (error) {
            setError('Failed to load print jobs: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
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

    return (
        <div className="print-job-history">
            <div className="history-header">
                <h3>Print Job History</h3>
                <button 
                    onClick={loadPrintJobs}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading && (
                <div className="loading">
                    Loading print jobs...
                </div>
            )}

            {!loading && !error && (
                <div className="jobs-list">
                    {printJobs.length === 0 ? (
                        <div className="no-jobs">
                            No print jobs found. Start printing labels to see history.
                        </div>
                    ) : (
                        printJobs.map(job => {
                            const status = getJobStatus(job);
                            return (
                                <div key={job.id} className="job-item">
                                    <div className="job-header">
                                        <div className="job-title">
                                            <strong>{job.title}</strong>
                                            <span className="job-id">#{job.id}</span>
                                        </div>
                                        <div className="job-status">
                                            <span 
                                                className="status-indicator"
                                                style={{ backgroundColor: status.color }}
                                            />
                                            {status.label}
                                        </div>
                                    </div>
                                    
                                    <div className="job-details">
                                        <div className="job-info">
                                            <span><strong>Printer:</strong> {job.printer?.name || 'Unknown'}</span>
                                            <span><strong>Created:</strong> {formatDate(job.createTimestamp)}</span>
                                            {job.completeTimestamp && (
                                                <span><strong>Completed:</strong> {formatDate(job.completeTimestamp)}</span>
                                            )}
                                        </div>
                                        
                                        {job.state === 'failed' && job.error && (
                                            <div className="job-error">
                                                <strong>Error:</strong> {job.error}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
} 