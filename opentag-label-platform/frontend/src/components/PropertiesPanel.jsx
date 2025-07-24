import { useState, useEffect } from 'react';

export default function PropertiesPanel({ selectedElement, template, onTemplateChange, onElementSelect }) {
    const [localElement, setLocalElement] = useState(null);

    useEffect(() => {
        if (selectedElement) {
            setLocalElement({ ...selectedElement });
        } else {
            setLocalElement(null);
        }
    }, [selectedElement]);

    // Early return if no element is selected
    if (!selectedElement || !localElement) {
        return (
            <div className="properties-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3>Element Properties</h3>
                </div>
                <div className="no-selection-message">
                    <p>No element selected.</p>
                    <div className="selection-tips">
                        <h4>Tips:</h4>
                        <p className="tip-item">Click an element on the canvas to select it.</p>
                        <p className="tip-item">Hold <span className="keyboard-shortcut">Ctrl</span> (or <span className="keyboard-shortcut">Cmd</span>) and click to multi-select.</p>
                        <p className="tip-item">Click on empty canvas or press <span className="keyboard-shortcut">Esc</span> to unselect.</p>
                        <p className="tip-item">Use the <span className="keyboard-shortcut">Delete</span> key to remove selected elements.</p>
                    </div>
                </div>
            </div>
        );
    }

    const updateElement = (updates) => {
        const newLocalElement = { ...localElement, ...updates };
        setLocalElement(newLocalElement);

        // Update template
        const updatedElements = template.elements.map(el => 
            el.id === selectedElement.id ? newLocalElement : el
        );
        
        onTemplateChange({
            ...template,
            elements: updatedElements
        });
    };

    const handleTextChange = (field, value) => {
        updateElement({ [field]: value });
    };

    const handleNumberChange = (field, value) => {
        const numValue = parseFloat(value) || 0;
        updateElement({ [field]: numValue });
    };

    const handleColorChange = (field, value) => {
        updateElement({ [field]: value });
    };

    return (
        <div className="properties-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>Element Properties</h3>
                <button 
                    onClick={() => onElementSelect && onElementSelect(null)}
                    style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                    }}
                    title="Unselect element"
                >
                    ✕
                </button>
            </div>
            
            {localElement && (
                <>
                    <div className="property-group">
                        <label>Type</label>
                        <div className="property-value">{localElement.type}</div>
                    </div>

                    <div className="property-group">
                        <label>Position X (mm)</label>
                        <input
                            type="number"
                            value={localElement.x}
                            onChange={(e) => handleNumberChange('x', e.target.value)}
                            step="0.5"
                            min="0"
                        />
                    </div>

                    <div className="property-group">
                        <label>Position Y (mm)</label>
                        <input
                            type="number"
                            value={localElement.y}
                            onChange={(e) => handleNumberChange('y', e.target.value)}
                            step="0.5"
                            min="0"
                        />
                    </div>

                    <div className="property-group">
                        <label>Rotation (degrees)</label>
                        <input
                            type="number"
                            value={localElement.rotation || 0}
                            onChange={(e) => handleNumberChange('rotation', e.target.value)}
                            step="1"
                            min="0"
                            max="360"
                        />
                    </div>

                    {localElement.type === 'text' && (
                        <>
                            <div className="property-group">
                                <label>Text Content</label>
                                <input
                                    type="text"
                                    value={localElement.text || ''}
                                    onChange={(e) => handleTextChange('text', e.target.value)}
                                    placeholder="Enter text..."
                                />
                            </div>

                            <div className="property-group">
                                <label>Font Size (pt)</label>
                                <input
                                    type="number"
                                    value={localElement.fontSize || 10}
                                    onChange={(e) => handleNumberChange('fontSize', e.target.value)}
                                    step="0.5"
                                    min="1"
                                    max="50"
                                />
                            </div>

                            <div className="property-group">
                                <label>Text Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.textColor || '#000000'}
                                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.textColor || '#000000'}
                                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                                        placeholder="#000000"
                                        className="color-input"
                                    />
                                </div>
                            </div>

                            <div className="property-group">
                                <label>Background Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        placeholder="#ffffff"
                                        className="color-input"
                                    />
                                </div>
                            </div>

                            <div className="property-group">
                                <label>Font Weight</label>
                                <select
                                    value={localElement.fontWeight || 'normal'}
                                    onChange={(e) => handleTextChange('fontWeight', e.target.value)}
                                >
                                    <option value="normal">Normal</option>
                                    <option value="bold">Bold</option>
                                    <option value="lighter">Light</option>
                                </select>
                            </div>
                        </>
                    )}

                    {localElement.type === 'qrcode' && (
                        <>
                            <div className="property-group">
                                <label>QR Data</label>
                                <textarea
                                    value={localElement.data || ''}
                                    onChange={(e) => handleTextChange('data', e.target.value)}
                                    placeholder="Enter URL or text for QR code..."
                                    rows="3"
                                />
                            </div>

                            <div className="property-group">
                                <label>Size (mm)</label>
                                <input
                                    type="number"
                                    value={localElement.size || 12}
                                    onChange={(e) => handleNumberChange('size', e.target.value)}
                                    step="0.5"
                                    min="5"
                                    max="50"
                                />
                            </div>

                            <div className="property-group">
                                <label>QR Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.qrColor || '#000000'}
                                        onChange={(e) => handleColorChange('qrColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.qrColor || '#000000'}
                                        onChange={(e) => handleColorChange('qrColor', e.target.value)}
                                        placeholder="#000000"
                                        className="color-input"
                                    />
                                </div>
                            </div>

                            <div className="property-group">
                                <label>Background Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        placeholder="#ffffff"
                                        className="color-input"
                                    />
                                </div>
                            </div>

                            {localElement.data && (
                                <div className="property-group">
                                    <label>QR Preview</label>
                                    <div className="qr-preview">
                                        <img 
                                            src={`data:image/png;base64,${btoa(localElement.data)}`}
                                            alt="QR Preview"
                                            style={{ width: '100px', height: '100px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {localElement.type === 'barcode' && (
                        <>
                            <div className="property-group">
                                <label>Barcode Data</label>
                                <input
                                    type="text"
                                    value={localElement.data || ''}
                                    onChange={(e) => handleTextChange('data', e.target.value)}
                                    placeholder="Enter barcode data..."
                                />
                            </div>

                            <div className="property-group">
                                <label>Barcode Type</label>
                                <select
                                    value={localElement.barcodeType || 'code128'}
                                    onChange={(e) => handleTextChange('barcodeType', e.target.value)}
                                >
                                    <option value="code128">Code 128</option>
                                    <option value="code39">Code 39</option>
                                    <option value="ean13">EAN-13</option>
                                    <option value="ean8">EAN-8</option>
                                    <option value="upca">UPC-A</option>
                                    <option value="upce">UPC-E</option>
                                </select>
                            </div>

                            <div className="property-group">
                                <label>Width (mm)</label>
                                <input
                                    type="number"
                                    value={localElement.width || 50}
                                    onChange={(e) => handleNumberChange('width', e.target.value)}
                                    step="1"
                                    min="10"
                                    max="100"
                                />
                            </div>

                            <div className="property-group">
                                <label>Height (mm)</label>
                                <input
                                    type="number"
                                    value={localElement.height || 10}
                                    onChange={(e) => handleNumberChange('height', e.target.value)}
                                    step="1"
                                    min="5"
                                    max="50"
                                />
                            </div>

                            <div className="property-group">
                                <label>Show Text</label>
                                <input
                                    type="checkbox"
                                    checked={localElement.showText !== false}
                                    onChange={(e) => handleTextChange('showText', e.target.checked)}
                                />
                            </div>

                            <div className="property-group">
                                <label>Text Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.textColor || '#000000'}
                                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.textColor || '#000000'}
                                        onChange={(e) => handleColorChange('textColor', e.target.value)}
                                        placeholder="#000000"
                                        className="color-input"
                                    />
                                </div>
                            </div>

                            <div className="property-group">
                                <label>Background Color</label>
                                <div className="color-picker-container">
                                    <input
                                        type="color"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={localElement.backgroundColor || '#ffffff'}
                                        onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                                        placeholder="#ffffff"
                                        className="color-input"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {localElement.type === 'image' && (
                        <>
                            <div className="property-group">
                                <label>Image Preview</label>
                                <div className="image-preview-small">
                                    {localElement.imageData && (
                                        <img 
                                            src={localElement.imageData}
                                            alt="Image Preview"
                                            style={{ 
                                                maxWidth: '100px', 
                                                maxHeight: '100px',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="property-group">
                                <label>Width (mm)</label>
                                <input
                                    type="number"
                                    value={localElement.width || 20}
                                    onChange={(e) => handleNumberChange('width', e.target.value)}
                                    step="1"
                                    min="5"
                                    max="100"
                                />
                            </div>

                            <div className="property-group">
                                <label>Height (mm)</label>
                                <input
                                    type="number"
                                    value={localElement.height || 20}
                                    onChange={(e) => handleNumberChange('height', e.target.value)}
                                    step="1"
                                    min="5"
                                    max="100"
                                />
                            </div>

                            <div className="property-group">
                                <label>Maintain Aspect Ratio</label>
                                <input
                                    type="checkbox"
                                    checked={localElement.maintainAspectRatio !== false}
                                    onChange={(e) => handleTextChange('maintainAspectRatio', e.target.checked)}
                                />
                            </div>

                            {localElement.originalWidth && localElement.originalHeight && (
                                <div className="property-group">
                                    <label>Original Size</label>
                                    <div className="property-value">
                                        {localElement.originalWidth} × {localElement.originalHeight}px
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <div className="property-actions">
                <button 
                    className="btn btn-danger"
                    onClick={() => {
                        const updatedElements = template.elements.filter(el => el.id !== selectedElement.id);
                        onTemplateChange({
                            ...template,
                            elements: updatedElements
                        });
                    }}
                >
                    Delete Element
                </button>
            </div>
        </div>
    );
} 