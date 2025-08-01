import React, { useState } from 'react';

export default function ElementToolbar({ onAddElement, onAddImage }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showBarcodeTypes, setShowBarcodeTypes] = useState(false);

    const elementTypes = [
        {
            type: 'text',
            label: 'Text',
            icon: '📝',
            description: 'Add text elements with custom fonts and colors',
            defaultProps: {
                text: 'New Text',
                fontSize: 10,
                textColor: '#000000',
                backgroundColor: '#ffffff',
                fontWeight: 'normal',
                fontStyle: 'normal',
                textAlign: 'left'
            }
        },
        {
            type: 'qrcode',
            label: 'QR Code',
            icon: '📱',
            description: 'Generate QR codes with custom data and colors',
            defaultProps: {
                data: 'https://example.com',
                size: 12,
                qrColor: '#000000',
                backgroundColor: '#ffffff',
                errorCorrectionLevel: 'M'
            }
        },
        {
            type: 'barcode',
            label: 'Barcode',
            icon: '📊',
            description: 'Create various barcode formats',
            defaultProps: {
                data: '123456789',
                barcodeType: 'code128',
                width: 50,
                height: 10,
                showText: true,
                textColor: '#000000',
                backgroundColor: '#ffffff'
            }
        },
        {
            type: 'rectangle',
            label: 'Rectangle',
            icon: '⬜',
            description: 'Add rectangular shapes and borders',
            defaultProps: {
                width: 30,
                height: 20,
                fillColor: '#ffffff',
                strokeColor: '#000000',
                strokeWidth: 1,
                cornerRadius: 0
            }
        },
        {
            type: 'circle',
            label: 'Circle',
            icon: '⭕',
            description: 'Add circular shapes and indicators',
            defaultProps: {
                radius: 10,
                fillColor: '#ffffff',
                strokeColor: '#000000',
                strokeWidth: 1
            }
        },
        {
            type: 'line',
            label: 'Line',
            icon: '➖',
            description: 'Add straight lines and dividers',
            defaultProps: {
                endX: 40,
                endY: 10,
                strokeColor: '#000000',
                strokeWidth: 1,
                lineStyle: 'solid'
            }
        },
        {
            type: 'image',
            label: 'Image',
            icon: '🖼️',
            description: 'Upload and add images/logos',
            defaultProps: {
                width: 20,
                height: 20,
                maintainAspectRatio: true
            }
        }
    ];

    const barcodeTypes = [
        { value: 'code128', label: 'Code 128', description: 'Alphanumeric barcode' },
        { value: 'code39', label: 'Code 39', description: 'Alphanumeric barcode' },
        { value: 'ean13', label: 'EAN-13', description: '13-digit product code' },
        { value: 'ean8', label: 'EAN-8', description: '8-digit product code' },
        { value: 'upca', label: 'UPC-A', description: '12-digit product code' },
        { value: 'upce', label: 'UPC-E', description: 'Compressed UPC code' },
        { value: 'datamatrix', label: 'Data Matrix', description: '2D barcode' },
        { value: 'qr', label: 'QR Code', description: '2D QR code' }
    ];

    const handleAddElement = (elementType) => {
        const elementConfig = elementTypes.find(e => e.type === elementType);
        if (elementConfig) {
            onAddElement(elementType, elementConfig.defaultProps);
        }
    };

    const handleAddBarcode = (barcodeType) => {
        const barcodeConfig = barcodeTypes.find(b => b.value === barcodeType);
        if (barcodeConfig) {
            onAddElement('barcode', {
                ...elementTypes.find(e => e.type === 'barcode').defaultProps,
                barcodeType: barcodeType,
                data: barcodeType === 'ean13' ? '1234567890123' : 
                      barcodeType === 'ean8' ? '12345678' :
                      barcodeType === 'upca' ? '123456789012' :
                      barcodeType === 'upce' ? '123456' : '123456789'
            });
        }
        setShowBarcodeTypes(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageElement = {
                    id: `image-${Date.now()}`,
                    type: 'image',
                    x: 10,
                    y: 10,
                    imageData: e.target.result,
                    width: 20,
                    height: 20,
                    maintainAspectRatio: true,
                    originalWidth: 0,
                    originalHeight: 0
                };
                onAddImage(imageElement);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="element-toolbar">
            <div className="toolbar-header">
                <h3>Add Elements</h3>
                <button 
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                >
                    {showAdvanced ? 'Basic' : 'Advanced'}
                </button>
            </div>

            <div className="element-grid">
                {elementTypes.slice(0, showAdvanced ? elementTypes.length : 4).map((element) => (
                    <div key={element.type} className="element-item">
                        {element.type === 'barcode' ? (
                            <div className="barcode-dropdown">
                                <button 
                                    className="element-button"
                                    onClick={() => setShowBarcodeTypes(!showBarcodeTypes)}
                                    title={element.description}
                                >
                                    <span className="element-icon">{element.icon}</span>
                                    <span className="element-label">{element.label}</span>
                                </button>
                                {showBarcodeTypes && (
                                    <div className="barcode-dropdown-menu">
                                        {barcodeTypes.map((barcode) => (
                                            <button
                                                key={barcode.value}
                                                className="barcode-option"
                                                onClick={() => handleAddBarcode(barcode.value)}
                                                title={barcode.description}
                                            >
                                                <span className="barcode-label">{barcode.label}</span>
                                                <span className="barcode-desc">{barcode.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : element.type === 'image' ? (
                            <label className="element-button image-upload">
                                <span className="element-icon">{element.icon}</span>
                                <span className="element-label">{element.label}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        ) : (
                            <button 
                                className="element-button"
                                onClick={() => handleAddElement(element.type)}
                                title={element.description}
                            >
                                <span className="element-icon">{element.icon}</span>
                                <span className="element-label">{element.label}</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {showAdvanced && (
                <div className="advanced-tools">
                    <h4>Advanced Tools</h4>
                    <div className="tool-buttons">
                        <button className="btn btn-sm btn-secondary" title="Add multiple elements at once">
                            📦 Batch Add
                        </button>
                        <button className="btn btn-sm btn-secondary" title="Import elements from template">
                            📥 Import
                        </button>
                        <button className="btn btn-sm btn-secondary" title="Export current elements">
                            📤 Export
                        </button>
                    </div>
                </div>
            )}

            <div className="toolbar-tips">
                <h4>💡 Tips</h4>
                <ul>
                    <li>Use <kbd>Ctrl+Click</kbd> to select multiple elements</li>
                    <li>Press <kbd>Delete</kbd> to remove selected elements</li>
                    <li>Use <kbd>Escape</kbd> to unselect elements</li>
                    <li>Drag elements to reposition them</li>
                    <li>Use resize handles to adjust element size</li>
                </ul>
            </div>
        </div>
    );
} 