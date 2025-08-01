import { Stage, Layer, Text, Rect, Image, Transformer, Group } from 'react-konva';
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';

export default function CanvasDesigner({ template, onTemplateChange, selectedElement, onElementSelect }) {
    const [qrImages, setQrImages] = useState({});
    const [imageRefs, setImageRefs] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);
    const transformerRef = useRef();
    
    // Scale factor: 1mm = 5px for better visibility
    const scale = 5;
    const width = template.widthMm * scale;
    const height = template.heightMm * scale;
    
    // Grid snapping settings
    const gridSize = 5; // 5px = 1mm grid
    const snapToGrid = true;

    useEffect(() => {
        // Generate QR codes for all qrcode elements
        const generateQRCodes = async () => {
            const newQrImages = {};
            
            for (const el of template.elements) {
                if (el.type === 'qrcode') {
                    try {
                        const qrDataUrl = await QRCode.toDataURL(el.data || '', {
                            width: el.size * scale,
                            margin: 0
                        });
                        
                        const img = new window.Image();
                        img.src = qrDataUrl;
                        await new Promise((resolve) => {
                            img.onload = resolve;
                        });
                        
                        newQrImages[`${el.x}-${el.y}`] = img;
                    } catch (error) {
                        console.error('QR generation failed:', error);
                    }
                }
            }
            
            setQrImages(newQrImages);
        };

        generateQRCodes();
    }, [template]);

    useEffect(() => {
        // Load images for all image elements
        const loadImages = async () => {
            const newImageRefs = {};
            
            for (const el of template.elements) {
                if (el.type === 'image' && el.imageData) {
                    try {
                        console.log('Loading image for element:', el.id, 'Data length:', el.imageData.length);
                        const img = new window.Image();
                        img.src = el.imageData;
                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                console.log('Image loaded successfully:', el.id, 'Size:', img.width, 'x', img.height);
                                resolve();
                            };
                            img.onerror = (error) => {
                                console.error('Image loading failed:', el.id, error);
                                reject(error);
                            };
                        });
                        
                        newImageRefs[el.id] = img;
                    } catch (error) {
                        console.error('Image loading failed:', error);
                    }
                }
            }
            
            console.log('Loaded image refs:', Object.keys(newImageRefs));
            setImageRefs(newImageRefs);
        };

        loadImages();
    }, [template]);

    useEffect(() => {
        if (selectedIds.length > 0 && transformerRef.current) {
            const stage = transformerRef.current.getStage();
            if (!stage) return;
            
            const nodes = selectedIds.map(id => {
                const node = stage.findOne(`#${id}`);
                return node;
            }).filter(Boolean);
            
            if (nodes.length > 0) {
                try {
                    transformerRef.current.nodes(nodes);
                    transformerRef.current.getLayer().batchDraw();
                } catch (error) {
                    console.error('Transformer error:', error);
                    // If there's an error, clear the selection
                    setSelectedIds([]);
                    onElementSelect && onElementSelect(null);
                }
            } else {
                // No valid nodes found, clear selection
                setSelectedIds([]);
                onElementSelect && onElementSelect(null);
            }
        } else if (transformerRef.current) {
            try {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer().batchDraw();
            } catch (error) {
                console.error('Transformer cleanup error:', error);
            }
        }
    }, [selectedIds, onElementSelect]);

    useEffect(() => {
        // Clean up selectedIds when elements are deleted
        const validElementIds = template.elements.map(el => el.id);
        const invalidSelectedIds = selectedIds.filter(id => !validElementIds.includes(id));
        
        if (invalidSelectedIds.length > 0) {
            console.log('Cleaning up invalid selected IDs:', invalidSelectedIds);
            setSelectedIds(prev => prev.filter(id => validElementIds.includes(id)));
            
            // If all selected elements were deleted, clear the selection
            if (selectedIds.length === invalidSelectedIds.length) {
                onElementSelect && onElementSelect(null);
            }
        }
    }, [template.elements, selectedIds, onElementSelect]);

    useEffect(() => {
        // Cleanup function to reset transformer when elements change
        return () => {
            if (transformerRef.current) {
                try {
                    transformerRef.current.nodes([]);
                    transformerRef.current.getLayer().batchDraw();
                } catch (error) {
                    console.error('Transformer cleanup error:', error);
                }
            }
        };
    }, [template.elements]); // Re-run when elements change

    useEffect(() => {
        // Add keyboard event listener for Escape key
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && selectedIds.length > 0) {
                setSelectedIds([]);
                onElementSelect && onElementSelect(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedIds, onElementSelect]);

    const handleElementClick = (elementId, e) => {
        if (e.evt.ctrlKey || e.evt.metaKey) {
            // Multi-select functionality
            setSelectedIds(prev => {
                if (prev.includes(elementId)) {
                    return prev.filter(id => id !== elementId);
                } else {
                    return [...prev, elementId];
                }
            });
            onElementSelect && onElementSelect(elementId);
        } else {
            // Single select
            setSelectedIds([elementId]);
            onElementSelect && onElementSelect(elementId);
        }
    };

    const handleStageClick = (e) => {
        // If clicked on stage but not on an element, unselect all
        if (e.target === e.target.getStage()) {
            setSelectedIds([]);
            onElementSelect && onElementSelect(null);
        }
    };

    const snapToGridValue = (value) => {
        if (!snapToGrid) return value;
        return Math.round(value / gridSize) * gridSize;
    };

    const handleDragEnd = (elementId, newX, newY) => {
        // Snap to grid and convert back to mm coordinates
        const snappedX = snapToGridValue(newX);
        const snappedY = snapToGridValue(newY);
        const mmX = Math.round(snappedX / scale);
        const mmY = Math.round(snappedY / scale);
        
        const updatedElements = template.elements.map(el => {
            if (el.id === elementId) {
                return { ...el, x: mmX, y: mmY };
            }
            return el;
        });
        
        onTemplateChange && onTemplateChange({
            ...template,
            elements: updatedElements
        });
    };

    const handleTransformEnd = (elementIds, newProps) => {
        const updatedElements = template.elements.map(el => {
            if (elementIds.includes(el.id)) {
                const updated = { ...el };
                
                // Update position with grid snapping
                updated.x = Math.round(snapToGridValue(newProps.x) / scale);
                updated.y = Math.round(snapToGridValue(newProps.y) / scale);
                
                // Update size for QR codes and images
                if (el.type === 'qrcode' && newProps.width) {
                    updated.size = Math.round(snapToGridValue(newProps.width) / scale);
                }
                
                // Update font size for text
                if (el.type === 'text' && newProps.fontSize) {
                    updated.fontSize = Math.round(snapToGridValue(newProps.fontSize) / scale);
                }
                
                // Update rotation
                if (newProps.rotation !== undefined) {
                    updated.rotation = newProps.rotation;
                }
                
                return updated;
            }
            return el;
        });
        
        onTemplateChange && onTemplateChange({
            ...template,
            elements: updatedElements
        });
    };

    const bringToFront = (elementId) => {
        const updatedElements = [...template.elements];
        const index = updatedElements.findIndex(el => el.id === elementId);
        if (index > 0) {
            const element = updatedElements.splice(index, 1)[0];
            updatedElements.unshift(element);
            onTemplateChange && onTemplateChange({
                ...template,
                elements: updatedElements
            });
        }
    };

    const sendToBack = (elementId) => {
        const updatedElements = [...template.elements];
        const index = updatedElements.findIndex(el => el.id === elementId);
        if (index < updatedElements.length - 1) {
            const element = updatedElements.splice(index, 1)[0];
            updatedElements.push(element);
            onTemplateChange && onTemplateChange({
                ...template,
                elements: updatedElements
            });
        }
    };

    const groupElements = () => {
        if (selectedIds.length < 2) return;
        
        const selectedElements = template.elements.filter(el => selectedIds.includes(el.id));
        const remainingElements = template.elements.filter(el => !selectedIds.includes(el.id));
        
        // Create a group element
        const groupElement = {
            id: `group-${Date.now()}`,
            type: 'group',
            elements: selectedElements,
            x: Math.min(...selectedElements.map(el => el.x)),
            y: Math.min(...selectedElements.map(el => el.y)),
            width: Math.max(...selectedElements.map(el => el.x + (el.width || el.size || 0))) - Math.min(...selectedElements.map(el => el.x)),
            height: Math.max(...selectedElements.map(el => el.y + (el.height || el.size || 0))) - Math.min(...selectedElements.map(el => el.y))
        };
        
        onTemplateChange && onTemplateChange({
            ...template,
            elements: [...remainingElements, groupElement]
        });
        
        setSelectedIds([groupElement.id]);
    };

    const ungroupElements = () => {
        const selectedElement = template.elements.find(el => el.id === selectedIds[0]);
        if (!selectedElement || selectedElement.type !== 'group') return;
        
        const remainingElements = template.elements.filter(el => el.id !== selectedElement.id);
        const ungroupedElements = selectedElement.elements.map(el => ({
            ...el,
            x: el.x + selectedElement.x,
            y: el.y + selectedElement.y
        }));
        
        onTemplateChange && onTemplateChange({
            ...template,
            elements: [...remainingElements, ...ungroupedElements]
        });
        
        setSelectedIds([]);
    };

    const renderElement = (el, index) => {
        // Safety check for null or undefined elements
        if (!el || !el.id) {
            console.warn('Attempted to render invalid element:', el);
            return null;
        }
        
        const elementId = el.id || `element-${index}`;
        const scaledX = el.x * scale;
        const scaledY = el.y * scale;
        const isSelected = selectedIds.includes(elementId);
        
        // Common props for all elements (excluding key)
        const commonProps = {
            id: elementId,
            draggable: true,
            onClick: (e) => handleElementClick(elementId, e),
            onTap: (e) => handleElementClick(elementId, e),
            onDragEnd: (e) => handleDragEnd(elementId, e.target.x(), e.target.y()),
            ...(isSelected && { stroke: '#0096fd', strokeWidth: 2 })
        };

        switch (el.type) {
            case 'text':
                return (
                    <Text 
                        key={elementId}
                        {...commonProps}
                        text={el.text || 'Text'} 
                        x={scaledX} 
                        y={scaledY} 
                        fontSize={(el.fontSize || 12) * scale}
                        fill={el.textColor || "black"}
                        rotation={el.rotation || 0}
                        fontStyle={el.fontStyle || 'normal'}
                        fontWeight={el.fontWeight || 'normal'}
                        align={el.textAlign || 'left'}
                        onTransformEnd={() => handleTransformEnd([elementId], {
                            x: scaledX,
                            y: scaledY,
                            fontSize: (el.fontSize || 12) * scale,
                            rotation: el.rotation || 0
                        })}
                    />
                );

            case 'qrcode':
                const qrImage = qrImages[`${el.x}-${el.y}`];
                const scaledSize = el.size * scale;
                
                if (qrImage) {
                    return (
                        <Image
                            key={elementId}
                            {...commonProps}
                            x={scaledX}
                            y={scaledY}
                            image={qrImage}
                            width={scaledSize}
                            height={scaledSize}
                            rotation={el.rotation || 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                width: scaledSize,
                                rotation: el.rotation || 0
                            })}
                        />
                    );
                } else {
                    // Fallback to placeholder while QR is generating
                    return (
                        <Rect 
                            key={elementId}
                            {...commonProps}
                            x={scaledX} 
                            y={scaledY} 
                            width={scaledSize} 
                            height={scaledSize} 
                            stroke={isSelected ? "#0096fd" : "black"}
                            strokeWidth={isSelected ? 2 : 1}
                            fill="#f0f0f0"
                            rotation={el.rotation || 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                width: scaledSize,
                                rotation: el.rotation || 0
                            })}
                        />
                    );
                }

            case 'barcode':
                const scaledBarcodeWidth = el.width * scale;
                const scaledBarcodeHeight = el.height * scale;
                
                // For barcodes, we'll show a placeholder on canvas and generate in PDF
                return (
                    <Group key={elementId} {...commonProps}>
                        <Rect 
                            x={scaledX} 
                            y={scaledY} 
                            width={scaledBarcodeWidth} 
                            height={scaledBarcodeHeight} 
                            stroke={isSelected ? "#0096fd" : "black"}
                            strokeWidth={isSelected ? 2 : 1}
                            fill="#f8f8f8"
                            rotation={el.rotation || 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                width: scaledBarcodeWidth,
                                height: scaledBarcodeHeight,
                                rotation: el.rotation || 0
                            })}
                        />
                        <Text 
                            text={`${el.barcodeType || 'code128'}: ${el.data || '123456789'}`}
                            x={scaledX + 2} 
                            y={scaledY + scaledBarcodeHeight / 2 - 5}
                            fontSize={8}
                            fill="black"
                            rotation={el.rotation || 0}
                        />
                    </Group>
                );

            case 'rectangle':
                const scaledRectWidth = el.width * scale;
                const scaledRectHeight = el.height * scale;
                
                return (
                    <Rect 
                        key={elementId}
                        {...commonProps}
                        x={scaledX} 
                        y={scaledY} 
                        width={scaledRectWidth} 
                        height={scaledRectHeight} 
                        fill={el.fillColor || "#ffffff"}
                        stroke={el.strokeColor || "black"}
                        strokeWidth={(el.strokeWidth || 1) * scale}
                        cornerRadius={(el.cornerRadius || 0) * scale}
                        rotation={el.rotation || 0}
                        onTransformEnd={() => handleTransformEnd([elementId], {
                            x: scaledX,
                            y: scaledY,
                            width: scaledRectWidth,
                            height: scaledRectHeight,
                            rotation: el.rotation || 0
                        })}
                    />
                );

            case 'circle':
                const scaledRadius = el.radius * scale;
                
                return (
                    <Group key={elementId} {...commonProps}>
                        <Rect 
                            x={scaledX} 
                            y={scaledY} 
                            width={scaledRadius * 2} 
                            height={scaledRadius * 2} 
                            fill={el.fillColor || "#ffffff"}
                            stroke={el.strokeColor || "black"}
                            strokeWidth={(el.strokeWidth || 1) * scale}
                            cornerRadius={scaledRadius}
                            rotation={el.rotation || 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                width: scaledRadius * 2,
                                height: scaledRadius * 2,
                                rotation: el.rotation || 0
                            })}
                        />
                    </Group>
                );

            case 'line':
                const scaledEndX = el.endX * scale;
                const scaledEndY = el.endY * scale;
                
                return (
                    <Group key={elementId} {...commonProps}>
                        <Rect 
                            x={scaledX} 
                            y={scaledY} 
                            width={Math.abs(scaledEndX - scaledX)} 
                            height={Math.abs(scaledEndY - scaledY)} 
                            fill="transparent"
                            stroke={isSelected ? "#0096fd" : "transparent"}
                            strokeWidth={isSelected ? 1 : 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                endX: scaledEndX,
                                endY: scaledEndY
                            })}
                        />
                        {/* Line visualization - we'll use a thin rectangle for now */}
                        <Rect 
                            x={scaledX} 
                            y={scaledY + (scaledEndY - scaledY) / 2 - (el.strokeWidth || 1) * scale / 2} 
                            width={Math.abs(scaledEndX - scaledX)} 
                            height={(el.strokeWidth || 1) * scale} 
                            fill={el.strokeColor || "black"}
                            rotation={el.rotation || 0}
                        />
                    </Group>
                );

            case 'image':
                const imageRef = imageRefs[elementId];
                const scaledWidth = (el.width || 20) * scale;
                const scaledHeight = (el.height || 20) * scale;
                
                if (imageRef) {
                    return (
                        <Image
                            key={elementId}
                            {...commonProps}
                            x={scaledX}
                            y={scaledY}
                            width={scaledWidth}
                            height={scaledHeight}
                            image={imageRef}
                            rotation={el.rotation || 0}
                            onTransformEnd={() => handleTransformEnd([elementId], {
                                x: scaledX,
                                y: scaledY,
                                width: scaledWidth,
                                height: scaledHeight,
                                rotation: el.rotation || 0
                            })}
                        />
                    );
                } else {
                    // Fallback to placeholder while image is loading
                    return (
                        <Group key={elementId} {...commonProps}>
                            <Rect 
                                x={scaledX} 
                                y={scaledY} 
                                width={scaledWidth} 
                                height={scaledHeight} 
                                fill="#f0f0f0"
                                stroke={isSelected ? "#0096fd" : "black"}
                                strokeWidth={isSelected ? 2 : 1}
                                rotation={el.rotation || 0}
                                onTransformEnd={() => handleTransformEnd([elementId], {
                                    x: scaledX,
                                    y: scaledY,
                                    width: scaledWidth,
                                    height: scaledHeight,
                                    rotation: el.rotation || 0
                                })}
                            />
                            <Text 
                                text="IMG"
                                x={scaledX + 2} 
                                y={scaledY + 2}
                                fontSize={10}
                                fill="black"
                                rotation={el.rotation || 0}
                            />
                        </Group>
                    );
                }

            default:
                console.warn(`Unknown element type: ${el.type}`);
                return (
                    <Rect 
                        key={elementId}
                        {...commonProps}
                        x={scaledX} 
                        y={scaledY} 
                        width={20 * scale} 
                        height={20 * scale} 
                        fill="#ff0000"
                        stroke="black"
                        strokeWidth={1}
                    />
                );
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                Label Size: {template.widthMm}mm × {template.heightMm}mm (Scale: 1mm = {scale}px)
                {selectedIds.length > 0 && (
                    <span style={{ marginLeft: '20px', color: '#0096fd' }}>
                        • Selected: {selectedIds.length} element{selectedIds.length > 1 ? 's' : ''}
                        <button 
                            onClick={() => {
                                setSelectedIds([]);
                                onElementSelect && onElementSelect(null);
                            }}
                            style={{ 
                                marginLeft: '10px', 
                                padding: '2px 6px', 
                                fontSize: '10px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                            title="Unselect (or press Escape)"
                        >
                            ✕ Close
                        </button>
                        {selectedIds.length === 1 && (
                            <>
                                <button 
                                    onClick={() => bringToFront(selectedIds[0])}
                                    style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                    className="btn btn-sm btn-secondary"
                                >
                                    ↑ Front
                                </button>
                                <button 
                                    onClick={() => sendToBack(selectedIds[0])}
                                    style={{ marginLeft: '5px', padding: '2px 6px', fontSize: '10px' }}
                                    className="btn btn-sm btn-secondary"
                                >
                                    ↓ Back
                                </button>
                            </>
                        )}
                        {selectedIds.length > 1 && (
                            <>
                                <button 
                                    onClick={groupElements}
                                    style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                    className="btn btn-sm btn-secondary"
                                >
                                    📦 Group
                                </button>
                            </>
                        )}
                        {selectedIds.length === 1 && template.elements.find(el => el.id === selectedIds[0])?.type === 'group' && (
                            <button 
                                onClick={ungroupElements}
                                style={{ marginLeft: '10px', padding: '2px 6px', fontSize: '10px' }}
                                className="btn btn-sm btn-secondary"
                            >
                                📦 Ungroup
                            </button>
                        )}
                    </span>
                )}
            </div>
            <Stage 
                width={width} 
                height={height} 
                style={{ border: '1px solid #ccc' }}
                onClick={handleStageClick}
            >
                <Layer>
                    {/* Grid lines for better alignment */}
                    {Array.from({ length: Math.floor(width / gridSize) }, (_, i) => (
                        <Rect
                            key={`grid-v-${i}`}
                            x={i * gridSize}
                            y={0}
                            width={1}
                            height={height}
                            fill="#f0f0f0"
                        />
                    ))}
                    {Array.from({ length: Math.floor(height / gridSize) }, (_, i) => (
                        <Rect
                            key={`grid-h-${i}`}
                            x={0}
                            y={i * gridSize}
                            width={width}
                            height={1}
                            fill="#f0f0f0"
                        />
                    ))}
                    
                    {/* Render all elements */}
                    {template.elements
                        .filter(el => el && el.id) // Filter out null or invalid elements
                        .map((el, index) => renderElement(el, index))
                        .filter(Boolean) // Filter out any null returns from renderElement
                    }
                    
                    {/* Transformer for selected elements */}
                    {selectedIds.length > 0 && (
                        <Transformer
                            ref={transformerRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                // Limit resize
                                if (newBox.width < 5 || newBox.height < 5) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />
                )}
            </Layer>
        </Stage>
        </div>
    );
}