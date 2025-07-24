import { useState, useEffect } from 'react';

export default function TemplateSelector({ currentTemplate, onTemplateChange }) {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/templates');
            if (response.ok) {
                const data = await response.json();
                setTemplates(Array.isArray(data) ? data : [data]);
            }
        } catch (error) {
            console.error('Failed to load templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = async (templateName) => {
        const selectedTemplate = templates.find(t => t.name === templateName);
        if (selectedTemplate) {
            onTemplateChange(selectedTemplate);
        }
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) return;

        const templateToSave = {
            ...currentTemplate,
            name: newTemplateName.trim()
        };

        try {
            const response = await fetch('http://localhost:3000/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateToSave)
            });

            if (response.ok) {
                setShowSaveDialog(false);
                setNewTemplateName('');
                loadTemplates(); // Reload templates
            }
        } catch (error) {
            console.error('Failed to save template:', error);
        }
    };

    const handleDeleteTemplate = async (templateName) => {
        if (!confirm(`Are you sure you want to delete template "${templateName}"?`)) return;

        try {
            const response = await fetch(`http://localhost:3000/api/templates/${encodeURIComponent(templateName)}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadTemplates(); // Reload templates
            }
        } catch (error) {
            console.error('Failed to delete template:', error);
        }
    };

    return (
        <div className="template-selector">
            <h3>Template Management</h3>
            
            <div className="template-controls">
                <select 
                    value={currentTemplate.name || ''}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="template-select"
                    disabled={loading}
                >
                    <option value="">Select a template...</option>
                    {templates.map(template => (
                        <option key={template.name} value={template.name}>
                            {template.name} ({template.widthMm}×{template.heightMm}mm)
                        </option>
                    ))}
                </select>

                <button 
                    onClick={() => setShowSaveDialog(true)}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Save Current
                </button>
            </div>

            {showSaveDialog && (
                <div className="save-dialog">
                    <div className="save-dialog-content">
                        <h4>Save Template</h4>
                        <input
                            type="text"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Enter template name..."
                            className="template-name-input"
                        />
                        <div className="save-dialog-actions">
                            <button 
                                onClick={handleSaveTemplate}
                                className="btn btn-primary"
                                disabled={!newTemplateName.trim()}
                            >
                                Save
                            </button>
                            <button 
                                onClick={() => setShowSaveDialog(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {templates.length > 0 && (
                <div className="template-list">
                    <h4>Available Templates</h4>
                    <ul>
                        {templates.map(template => (
                            <li key={template.name} className="template-item">
                                <span className="template-info">
                                    <strong>{template.name}</strong>
                                    <span className="template-size">
                                        {template.widthMm}×{template.heightMm}mm
                                    </span>
                                    <span className="template-elements">
                                        {template.elements?.length || 0} elements
                                    </span>
                                </span>
                                <div className="template-actions">
                                    <button 
                                        onClick={() => handleTemplateSelect(template.name)}
                                        className="btn btn-sm btn-primary"
                                    >
                                        Load
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteTemplate(template.name)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {loading && <div className="loading">Loading templates...</div>}
        </div>
    );
} 