import { useState, useEffect } from 'react';

export default function PropertiesPanel({ selectedElement, template, onTemplateChange, onElementSelect }) {
    const [localElement, setLocalElement] = useState(selectedElement);

    useEffect(() => {
        setLocalElement(selectedElement);
    }, [selectedElement]);

    if (!selectedElement || !localElement) {
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
                <div className="no-selection-message">
                    <p>No element selected.</p>
                    <div className="selection-tips">
                        <h4>💡 Selection Tips:</h4>
                        <ul className="tip-list">
                            <li className="tip-item">Click on any element to select it</li>
                            <li className="tip-item">Hold <kbd>Ctrl</kbd> and click to select multiple elements</li>
                            <li className="tip-item">Press <kbd>Escape</kbd> to unselect all elements</li>
                            <li className="tip-item">Use <kbd>Delete</kbd> to remove selected elements</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    const updateElement = (updates) => {
        if (!localElement || !selectedElement) return;
        
        const updatedElement = { ...localElement, ...updates };
        setLocalElement(updatedElement);
        
        const updatedTemplate = {
            ...template,
            elements: template.elements.map(el => 
                el.id === selectedElement.id ? updatedElement : el
            )
        };
        onTemplateChange(updatedTemplate);
    };

    const renderCommonProperties = () => {
        if (!localElement) return null;
        
        return (
            <div className="property-group">
                <h4>Position & Size</h4>
                <div className="property-row">
                    <label>X Position (mm):</label>
                    <input
                        type="number"
                        value={localElement.x || 0}
                        onChange={(e) => updateElement({ x: parseFloat(e.target.value) || 0 })}
                        step="0.1"
                        min="0"
                    />
                </div>
                <div className="property-row">
                    <label>Y Position (mm):</label>
                    <input
                        type="number"
                        value={localElement.y || 0}
                        onChange={(e) => updateElement({ y: parseFloat(e.target.value) || 0 })}
                        step="0.1"
                        min="0"
                    />
                </div>
                <div className="property-row">
                    <label>Rotation (degrees):</label>
                    <input
                        type="number"
                        value={localElement.rotation || 0}
                        onChange={(e) => updateElement({ rotation: parseFloat(e.target.value) || 0 })}
                        step="1"
                        min="-360"
                        max="360"
                    />
                </div>
            </div>
        );
    };

    const renderTextProperties = () => {
        if (!localElement) return null;
        
        return (
            <div className="property-group">
                <h4>Text Properties</h4>
                <div className="property-row">
                    <label>Text Content:</label>
                    <textarea
                        value={localElement.text || ''}
                        onChange={(e) => updateElement({ text: e.target.value })}
                        rows="3"
                        placeholder="Enter text content..."
                    />
                </div>
                <div className="property-row">
                    <label>Font Size (pt):</label>
                    <input
                        type="number"
                        value={localElement.fontSize || 10}
                        onChange={(e) => updateElement({ fontSize: parseFloat(e.target.value) || 10 })}
                        min="1"
                        max="100"
                    />
                </div>
                <div className="property-row">
                    <label>Text Color:</label>
                    <input
                        type="color"
                        value={localElement.textColor || '#000000'}
                        onChange={(e) => updateElement({ textColor: e.target.value })}
                    />
                </div>
                <div className="property-row">
                    <label>Background Color:</label>
                    <input
                        type="color"
                        value={localElement.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                    />
                </div>
                <div className="property-row">
                    <label>Font Weight:</label>
                    <select
                        value={localElement.fontWeight || 'normal'}
                        onChange={(e) => updateElement({ fontWeight: e.target.value })}
                    >
                        <option value="normal">Normal</option>
                        <option value="bold">Bold</option>
                        <option value="lighter">Light</option>
                    </select>
                </div>
                <div className="property-row">
                    <label>Font Style:</label>
                    <select
                        value={localElement.fontStyle || 'normal'}
                        onChange={(e) => updateElement({ fontStyle: e.target.value })}
                    >
                        <option value="normal">Normal</option>
                        <option value="italic">Italic</option>
                    </select>
                </div>
                <div className="property-row">
                    <label>Text Align:</label>
                    <select
                        value={localElement.textAlign || 'left'}
                        onChange={(e) => updateElement({ textAlign: e.target.value })}
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>
            </div>
        );
    };

    const renderQRProperties = () => {
        if (!localElement) return null;
        
        return (
            <div className="property-group">
                <h4>QR Code Properties</h4>
                <div className="property-row">
                    <label>QR Data:</label>
                    <textarea
                        value={localElement.data || ''}
                        onChange={(e) => updateElement({ data: e.target.value })}
                        rows="3"
                        placeholder="Enter QR code data..."
                    />
                </div>
                <div className="property-row">
                    <label>Size (mm):</label>
                    <input
                        type="number"
                        value={localElement.size || 12}
                        onChange={(e) => updateElement({ size: parseFloat(e.target.value) || 12 })}
                        min="5"
                        max="50"
                    />
                </div>
                <div className="property-row">
                    <label>QR Color:</label>
                    <input
                        type="color"
                        value={localElement.qrColor || '#000000'}
                        onChange={(e) => updateElement({ qrColor: e.target.value })}
                    />
                </div>
                <div className="property-row">
                    <label>Background Color:</label>
                    <input
                        type="color"
                        value={localElement.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                    />
                </div>
                <div className="property-row">
                    <label>Error Correction:</label>
                    <select
                        value={localElement.errorCorrectionLevel || 'M'}
                        onChange={(e) => updateElement({ errorCorrectionLevel: e.target.value })}
                    >
                        <option value="L">Low (7%)</option>
                        <option value="M">Medium (15%)</option>
                        <option value="Q">Quartile (25%)</option>
                        <option value="H">High (30%)</option>
                    </select>
                </div>
            </div>
        );
    };

    const renderBarcodeProperties = () => {
        if (!localElement) return null;
        
        return (
            <div className="property-group">
                <h4>Barcode Properties</h4>
                <div className="property-row">
                    <label>Barcode Data:</label>
                    <input
                        type="text"
                        value={localElement.data || ''}
                        onChange={(e) => updateElement({ data: e.target.value })}
                        placeholder="Enter barcode data..."
                    />
                </div>
                <div className="property-row">
                    <label>Barcode Type:</label>
                    <select
                        value={localElement.barcodeType || 'code128'}
                        onChange={(e) => updateElement({ barcodeType: e.target.value })}
                    >
                        <option value="code128">Code 128</option>
                        <option value="code39">Code 39</option>
                        <option value="ean13">EAN-13</option>
                        <option value="ean8">EAN-8</option>
                        <option value="upca">UPC-A</option>
                        <option value="upce">UPC-E</option>
                        <option value="datamatrix">Data Matrix</option>
                    </select>
                </div>
                <div className="property-row">
                    <label>Width (mm):</label>
                    <input
                        type="number"
                        value={localElement.width || 50}
                        onChange={(e) => updateElement({ width: parseFloat(e.target.value) || 50 })}
                        min="10"
                        max="100"
                    />
                </div>
                <div className="property-row">
                    <label>Height (mm):</label>
                    <input
                        type="number"
                        value={localElement.height || 10}
                        onChange={(e) => updateElement({ height: parseFloat(e.target.value) || 10 })}
                        min="5"
                        max="50"
                    />
                </div>
                <div className="property-row">
                    <label>Show Text:</label>
                    <input
                        type="checkbox"
                        checked={localElement.showText !== false}
                        onChange={(e) => updateElement({ showText: e.target.checked })}
                    />
                </div>
                <div className="property-row">
                    <label>Text Color:</label>
                    <input
                        type="color"
                        value={localElement.textColor || '#000000'}
                        onChange={(e) => updateElement({ textColor: e.target.value })}
                    />
                </div>
                <div className="property-row">
                    <label>Background Color:</label>
                    <input
                        type="color"
                        value={localElement.backgroundColor || '#ffffff'}
                        onChange={(e) => updateElement({ backgroundColor: e.target.value })}
                    />
                </div>
            </div>
        );
    };

    const renderShapeProperties = () => {
        if (!localElement) return null;
        
        if (localElement.type === 'rectangle') {
            return (
                <div className="property-group">
                    <h4>Rectangle Properties</h4>
                    <div className="property-row">
                        <label>Width (mm):</label>
                        <input
                            type="number"
                            value={localElement.width || 30}
                            onChange={(e) => updateElement({ width: parseFloat(e.target.value) || 30 })}
                            min="1"
                            max="100"
                        />
                    </div>
                    <div className="property-row">
                        <label>Height (mm):</label>
                        <input
                            type="number"
                            value={localElement.height || 20}
                            onChange={(e) => updateElement({ height: parseFloat(e.target.value) || 20 })}
                            min="1"
                            max="100"
                        />
                    </div>
                    <div className="property-row">
                        <label>Fill Color:</label>
                        <input
                            type="color"
                            value={localElement.fillColor || '#ffffff'}
                            onChange={(e) => updateElement({ fillColor: e.target.value })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Color:</label>
                        <input
                            type="color"
                            value={localElement.strokeColor || '#000000'}
                            onChange={(e) => updateElement({ strokeColor: e.target.value })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Width:</label>
                        <input
                            type="number"
                            value={localElement.strokeWidth || 1}
                            onChange={(e) => updateElement({ strokeWidth: parseFloat(e.target.value) || 1 })}
                            min="0"
                            max="10"
                            step="0.5"
                        />
                    </div>
                    <div className="property-row">
                        <label>Corner Radius:</label>
                        <input
                            type="number"
                            value={localElement.cornerRadius || 0}
                            onChange={(e) => updateElement({ cornerRadius: parseFloat(e.target.value) || 0 })}
                            min="0"
                            max="20"
                        />
                    </div>
                </div>
            );
        } else if (localElement.type === 'circle') {
            return (
                <div className="property-group">
                    <h4>Circle Properties</h4>
                    <div className="property-row">
                        <label>Radius (mm):</label>
                        <input
                            type="number"
                            value={localElement.radius || 10}
                            onChange={(e) => updateElement({ radius: parseFloat(e.target.value) || 10 })}
                            min="1"
                            max="50"
                        />
                    </div>
                    <div className="property-row">
                        <label>Fill Color:</label>
                        <input
                            type="color"
                            value={localElement.fillColor || '#ffffff'}
                            onChange={(e) => updateElement({ fillColor: e.target.value })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Color:</label>
                        <input
                            type="color"
                            value={localElement.strokeColor || '#000000'}
                            onChange={(e) => updateElement({ strokeColor: e.target.value })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Width:</label>
                        <input
                            type="number"
                            value={localElement.strokeWidth || 1}
                            onChange={(e) => updateElement({ strokeWidth: parseFloat(e.target.value) || 1 })}
                            min="0"
                            max="10"
                            step="0.5"
                        />
                    </div>
                </div>
            );
        } else if (localElement.type === 'line') {
            return (
                <div className="property-group">
                    <h4>Line Properties</h4>
                    <div className="property-row">
                        <label>End X (mm):</label>
                        <input
                            type="number"
                            value={localElement.endX || 40}
                            onChange={(e) => updateElement({ endX: parseFloat(e.target.value) || 40 })}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="property-row">
                        <label>End Y (mm):</label>
                        <input
                            type="number"
                            value={localElement.endY || 10}
                            onChange={(e) => updateElement({ endY: parseFloat(e.target.value) || 10 })}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Color:</label>
                        <input
                            type="color"
                            value={localElement.strokeColor || '#000000'}
                            onChange={(e) => updateElement({ strokeColor: e.target.value })}
                        />
                    </div>
                    <div className="property-row">
                        <label>Stroke Width:</label>
                        <input
                            type="number"
                            value={localElement.strokeWidth || 1}
                            onChange={(e) => updateElement({ strokeWidth: parseFloat(e.target.value) || 1 })}
                            min="0.5"
                            max="10"
                            step="0.5"
                        />
                    </div>
                    <div className="property-row">
                        <label>Line Style:</label>
                        <select
                            value={localElement.lineStyle || 'solid'}
                            onChange={(e) => updateElement({ lineStyle: e.target.value })}
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                        </select>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderImageProperties = () => {
        if (!localElement) return null;
        
        return (
            <div className="property-group">
                <h4>Image Properties</h4>
                <div className="property-row">
                    <label>Width (mm):</label>
                    <input
                        type="number"
                        value={localElement.width || 20}
                        onChange={(e) => updateElement({ width: parseFloat(e.target.value) || 20 })}
                        min="1"
                        max="100"
                    />
                </div>
                <div className="property-row">
                    <label>Height (mm):</label>
                    <input
                        type="number"
                        value={localElement.height || 20}
                        onChange={(e) => updateElement({ height: parseFloat(e.target.value) || 20 })}
                        min="1"
                        max="100"
                    />
                </div>
                <div className="property-row">
                    <label>Maintain Aspect Ratio:</label>
                    <input
                        type="checkbox"
                        checked={localElement.maintainAspectRatio !== false}
                        onChange={(e) => updateElement({ maintainAspectRatio: e.target.checked })}
                    />
                </div>
                {localElement.imageData && (
                    <div className="property-row">
                        <label>Image Preview:</label>
                        <div className="image-preview-small">
                            <img 
                                src={localElement.imageData} 
                                alt="Preview" 
                                style={{ maxWidth: '100px', maxHeight: '100px' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
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

            <div className="element-info">
                <strong>Type:</strong> {localElement.type} | <strong>ID:</strong> {localElement.id}
            </div>

            {renderCommonProperties()}

            {localElement.type === 'text' && renderTextProperties()}
            {localElement.type === 'qrcode' && renderQRProperties()}
            {localElement.type === 'barcode' && renderBarcodeProperties()}
            {(localElement.type === 'rectangle' || localElement.type === 'circle' || localElement.type === 'line') && renderShapeProperties()}
            {localElement.type === 'image' && renderImageProperties()}

            <div className="property-actions">
                <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => {
                        if (selectedElement) {
                            const updatedTemplate = {
                                ...template,
                                elements: template.elements.filter(el => el.id !== selectedElement.id)
                            };
                            onTemplateChange(updatedTemplate);
                            onElementSelect(null);
                        }
                    }}
                >
                    Delete Element
                </button>
            </div>
        </div>
    );
} 