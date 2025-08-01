import { useState, useEffect } from 'react';
import CanvasDesigner from './components/CanvasDesigner';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateSelector from './components/TemplateSelector';
import PrinterSelector from './components/PrinterSelector';
import PrintJobHistory from './components/PrintJobHistory';
import PrintPreview from './components/PrintPreview';
import ImageUpload from './components/ImageUpload';
import ElementToolbar from './components/ElementToolbar';
import LabelSizeSelector from './components/LabelSizeSelector';
import PrintNodeManager from './components/PrintNodeManager';
import AdvancedPrintOptions from './components/AdvancedPrintOptions';
import './App.css';

function App() {
  const [template, setTemplate] = useState({
    name: "Brady 50x25 Label",
    widthMm: 50,
    heightMm: 25,
    elements: [
      { 
        id: 'text-1',
        type: 'text', 
        text: 'TAG-EX-1234', 
        x: 10, 
        y: 10, 
        fontSize: 10 
      },
      { 
        id: 'qr-1',
        type: 'qrcode', 
        data: 'https://example.com/cert/TAG-EX-1234', 
        x: 30, 
        y: 10, 
        size: 12 
      }
    ]
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('design'); // design, templates, printers, history, management
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    title: 'Label Print Job',
    source: 'OpenTag Label Platform',
    copies: 1
  });
  const [queueStatus, setQueueStatus] = useState({ queueSize: 0, isProcessing: false });
  const [useQueue, setUseQueue] = useState(true);

  useEffect(() => {
    // Load default printer from localStorage
    const savedPrinter = localStorage.getItem('defaultPrinter');
    if (savedPrinter) {
      setSelectedPrinter(savedPrinter);
    } else {
      // Load initial printer profiles if no default is set
      fetch('http://localhost:3000/api/printer-profiles')
        .then(res => res.json())
        .then(profiles => {
          if (profiles.length > 0) {
            setSelectedPrinter(profiles[0].name);
          }
        })
        .catch(err => console.error('Failed to load printer profiles:', err));
    }

    // Check initial queue status
    checkQueueStatus();
  }, []);

  // Periodically check queue status
  useEffect(() => {
    const interval = setInterval(checkQueueStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handlePrint = async () => {
    if (!selectedPrinter) {
      alert('Please select a printer');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          template, 
          printerId: selectedPrinter,
          printOptions,
          useQueue
        })
      });
      
      const result = await response.json();
      if (result.success) {
        if (useQueue) {
          alert(`Label added to queue! ${result.message}`);
          // Check queue status after adding to queue
          setTimeout(checkQueueStatus, 1000);
        } else {
          alert(`Print job sent! Job ID: ${result.jobId}`);
        }
      } else {
        alert('Print failed: ' + result.error);
      }
    } catch (error) {
      alert('Print failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewPDF = () => {
    setShowPrintPreview(true);
  };

  const handleAddElement = (type, defaultProps = {}) => {
    // Generate unique ID with timestamp and random suffix
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substr(2, 5);
    
    // Calculate better initial position based on label size
    const margin = 5; // Minimum margin from edges
    const centerX = template.widthMm / 2;
    const centerY = template.heightMm / 2;
    
    // Try to find a good position that doesn't overlap with existing elements
    let x = margin;
    let y = margin;
    
    // If there are existing elements, try to position near the last one
    if (template.elements.length > 0) {
      const lastElement = template.elements[template.elements.length - 1];
      x = Math.min(lastElement.x + 20, template.widthMm - 30);
      y = Math.min(lastElement.y + 15, template.heightMm - 20);
      
      // If we're near the edge, wrap to the next line
      if (x > template.widthMm - 30) {
        x = margin;
        y = Math.min(y + 25, template.heightMm - 20);
      }
    }
    
    const newElement = {
      id: `${type}-${timestamp}-${randomSuffix}`,
      type,
      x,
      y,
      rotation: 0
    };

    // Handle different element types with comprehensive defaults
    switch (type) {
      case 'text':
        Object.assign(newElement, {
          text: defaultProps.text || 'New Text',
          fontSize: defaultProps.fontSize || Math.min(10, template.heightMm / 3),
          textColor: defaultProps.textColor || '#000000',
          backgroundColor: defaultProps.backgroundColor || '#ffffff',
          fontWeight: defaultProps.fontWeight || 'normal',
          fontStyle: defaultProps.fontStyle || 'normal',
          textAlign: defaultProps.textAlign || 'left',
          width: defaultProps.width || Math.min(50, template.widthMm - 10),
          height: defaultProps.height || Math.min(15, template.heightMm / 2)
        });
        break;

      case 'qrcode':
        const qrSize = Math.min(defaultProps.size || 12, Math.min(template.widthMm, template.heightMm) / 3);
        Object.assign(newElement, {
          data: defaultProps.data || 'https://example.com',
          size: qrSize,
          qrColor: defaultProps.qrColor || '#000000',
          backgroundColor: defaultProps.backgroundColor || '#ffffff',
          errorCorrectionLevel: defaultProps.errorCorrectionLevel || 'M',
          width: qrSize,
          height: qrSize
        });
        break;

      case 'barcode':
        Object.assign(newElement, {
          data: defaultProps.data || '123456789',
          barcodeType: defaultProps.barcodeType || 'code128',
          width: defaultProps.width || Math.min(50, template.widthMm - 10),
          height: defaultProps.height || Math.min(10, template.heightMm / 3),
          showText: defaultProps.showText !== false,
          textColor: defaultProps.textColor || '#000000',
          backgroundColor: defaultProps.backgroundColor || '#ffffff'
        });
        break;

      case 'rectangle':
        Object.assign(newElement, {
          width: defaultProps.width || Math.min(30, template.widthMm / 2),
          height: defaultProps.height || Math.min(20, template.heightMm / 2),
          fillColor: defaultProps.fillColor || '#ffffff',
          strokeColor: defaultProps.strokeColor || '#000000',
          strokeWidth: defaultProps.strokeWidth || 1,
          cornerRadius: defaultProps.cornerRadius || 0
        });
        break;

      case 'circle':
        const radius = Math.min(defaultProps.radius || 10, Math.min(template.widthMm, template.heightMm) / 4);
        Object.assign(newElement, {
          radius: radius,
          fillColor: defaultProps.fillColor || '#ffffff',
          strokeColor: defaultProps.strokeColor || '#000000',
          strokeWidth: defaultProps.strokeWidth || 1,
          width: radius * 2,
          height: radius * 2
        });
        break;

      case 'line':
        Object.assign(newElement, {
          endX: defaultProps.endX || Math.min(40, template.widthMm - 5),
          endY: defaultProps.endY || Math.min(10, template.heightMm - 5),
          strokeColor: defaultProps.strokeColor || '#000000',
          strokeWidth: defaultProps.strokeWidth || 1,
          lineStyle: defaultProps.lineStyle || 'solid',
          width: Math.abs((defaultProps.endX || 40) - x),
          height: Math.abs((defaultProps.endY || 10) - y)
        });
        break;

      case 'image':
        Object.assign(newElement, {
          width: defaultProps.width || Math.min(20, template.widthMm / 3),
          height: defaultProps.height || Math.min(20, template.heightMm / 3),
          maintainAspectRatio: defaultProps.maintainAspectRatio !== false,
          imageData: defaultProps.imageData || null,
          originalWidth: defaultProps.originalWidth || 0,
          originalHeight: defaultProps.originalHeight || 0
        });
        break;

      default:
        console.warn(`Unknown element type: ${type}`);
        return;
    }

    // Validate the element before adding
    const validatedElement = validateElement(newElement, template);
    
    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, validatedElement]
    }));
  };

  // Validate element properties and handle edge cases
  const validateElement = (element, template) => {
    const validated = { ...element };

    // Ensure element is within canvas bounds
    const maxX = template.widthMm - (element.width || 10);
    const maxY = template.heightMm - (element.height || 10);
    
    validated.x = Math.max(0, Math.min(element.x, maxX));
    validated.y = Math.max(0, Math.min(element.y, maxY));

    // Validate specific element types
    switch (element.type) {
      case 'text':
        validated.fontSize = Math.max(1, Math.min(element.fontSize || 10, 100));
        validated.text = element.text || 'New Text';
        break;

      case 'qrcode':
        validated.size = Math.max(5, Math.min(element.size || 12, 50));
        validated.data = element.data || 'https://example.com';
        break;

      case 'barcode':
        validated.width = Math.max(10, Math.min(element.width || 50, template.widthMm));
        validated.height = Math.max(5, Math.min(element.height || 10, template.heightMm));
        validated.data = element.data || '123456789';
        break;

      case 'rectangle':
        validated.width = Math.max(1, Math.min(element.width || 30, template.widthMm));
        validated.height = Math.max(1, Math.min(element.height || 20, template.heightMm));
        validated.cornerRadius = Math.max(0, Math.min(element.cornerRadius || 0, Math.min(validated.width, validated.height) / 2));
        break;

      case 'circle':
        validated.radius = Math.max(1, Math.min(element.radius || 10, Math.min(template.widthMm, template.heightMm) / 2));
        validated.width = validated.radius * 2;
        validated.height = validated.radius * 2;
        break;

      case 'line':
        const maxEndX = template.widthMm;
        const maxEndY = template.heightMm;
        validated.endX = Math.max(0, Math.min(element.endX || 40, maxEndX));
        validated.endY = Math.max(0, Math.min(element.endY || 10, maxEndY));
        validated.strokeWidth = Math.max(0.5, Math.min(element.strokeWidth || 1, 10));
        break;

      case 'image':
        validated.width = Math.max(1, Math.min(element.width || 20, template.widthMm));
        validated.height = Math.max(1, Math.min(element.height || 20, template.heightMm));
        break;
    }

    return validated;
  };

  const handleAddImage = (imageElement) => {
    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, imageElement]
    }));
  };

  const handleElementSelect = (elementId) => {
    if (elementId === null) {
      setSelectedElement(null);
    } else {
      const element = template.elements.find(el => el.id === elementId);
      setSelectedElement(element);
    }
  };

  const handleTemplateChange = (newTemplate) => {
    // If the label size changed, we might need to reposition elements
    if (newTemplate.widthMm !== template.widthMm || newTemplate.heightMm !== template.heightMm) {
      const sizeChanged = true;
      const oldWidth = template.widthMm;
      const oldHeight = template.heightMm;
      
      // Reposition elements that are now outside the new label bounds
      const adjustedElements = newTemplate.elements.map(element => {
        const adjusted = { ...element };
        
        // Scale element positions proportionally if size changed significantly
        if (sizeChanged && (oldWidth !== newTemplate.widthMm || oldHeight !== newTemplate.heightMm)) {
          const scaleX = newTemplate.widthMm / oldWidth;
          const scaleY = newTemplate.heightMm / oldHeight;
          
          // Scale position
          adjusted.x = Math.min(element.x * scaleX, newTemplate.widthMm - (element.width || 10));
          adjusted.y = Math.min(element.y * scaleY, newTemplate.heightMm - (element.height || 10));
          
          // Scale element dimensions if they would be too large
          if (element.width && element.width * scaleX > newTemplate.widthMm) {
            adjusted.width = Math.max(5, newTemplate.widthMm - 10);
          }
          if (element.height && element.height * scaleY > newTemplate.heightMm) {
            adjusted.height = Math.max(5, newTemplate.heightMm - 10);
          }
          
          // Scale font size for text elements
          if (element.type === 'text' && element.fontSize) {
            adjusted.fontSize = Math.min(element.fontSize * Math.min(scaleX, scaleY), newTemplate.heightMm / 2);
          }
          
          // Scale QR code size
          if (element.type === 'qrcode' && element.size) {
            adjusted.size = Math.min(element.size * Math.min(scaleX, scaleY), Math.min(newTemplate.widthMm, newTemplate.heightMm) / 3);
            adjusted.width = adjusted.size;
            adjusted.height = adjusted.size;
          }
        }
        
        // Ensure element is within bounds
        adjusted.x = Math.max(0, Math.min(adjusted.x, newTemplate.widthMm - (adjusted.width || 10)));
        adjusted.y = Math.max(0, Math.min(adjusted.y, newTemplate.heightMm - (adjusted.height || 10)));
        
        return adjusted;
      });
      
      newTemplate.elements = adjustedElements;
    }
    
    setTemplate(newTemplate);
  };

  const handleSetDefaultPrinter = (printerId) => {
    setSelectedPrinter(printerId);
    localStorage.setItem('defaultPrinter', printerId);
  };

  const checkQueueStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/queue/status');
      if (response.ok) {
        const status = await response.json();
        setQueueStatus(status);
      }
    } catch (error) {
      console.error('Failed to check queue status:', error);
    }
  };

  const clearQueue = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/queue/clear', {
        method: 'POST'
      });
      if (response.ok) {
        setQueueStatus({ queueSize: 0, isProcessing: false });
      }
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>OpenTag Label Platform</h1>
        <div className="controls">
          <div className="queue-status">
            {queueStatus.queueSize > 0 && (
              <span className="queue-indicator">
                Queue: {queueStatus.queueSize} labels
                {queueStatus.isProcessing && ' (Processing...)'}
              </span>
            )}
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="btn btn-secondary"
            style={{ marginRight: '10px' }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          
          <button onClick={handlePreviewPDF} className="btn btn-secondary">
            Preview PDF
          </button>
          
          <button 
            onClick={handlePrint} 
            disabled={loading || !selectedPrinter}
            className="btn btn-primary"
          >
            {loading ? 'Printing...' : 'Print Label'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="left-panel">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'design' ? 'active' : ''}`}
              onClick={() => setActiveTab('design')}
            >
              Design
            </button>
            <button 
              className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              Templates
            </button>
            <button 
              className={`tab-button ${activeTab === 'printers' ? 'active' : ''}`}
              onClick={() => setActiveTab('printers')}
            >
              Printers
            </button>
            <button 
              className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
            <button 
              className={`tab-button ${activeTab === 'management' ? 'active' : ''}`}
              onClick={() => setActiveTab('management')}
            >
              Management
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'design' && (
              <div className="design-tab">
                <LabelSizeSelector 
                  template={template}
                  onTemplateChange={handleTemplateChange}
                />

                <ElementToolbar 
                  onAddElement={handleAddElement}
                  onAddImage={handleAddImage}
                />

                <ImageUpload onImageAdd={handleAddImage} />

                <div className="designer-container">
                  <h3>Label Designer</h3>
                  <CanvasDesigner 
                    template={template} 
                    onTemplateChange={handleTemplateChange}
                    selectedElement={selectedElement}
                    onElementSelect={handleElementSelect}
                  />
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="templates-tab">
                <TemplateSelector 
                  currentTemplate={template}
                  onTemplateChange={handleTemplateChange}
                />
              </div>
            )}

            {activeTab === 'printers' && (
              <div className="printers-tab">
                <div className="print-section">
                  <h3>Printer Selection</h3>
                  <PrinterSelector 
                    selectedPrinter={selectedPrinter}
                    onPrinterChange={setSelectedPrinter}
                  />
                </div>
                
                <div className="print-section">
                  <h3>Print Options</h3>
                  <div className="queue-controls">
                    <label>
                      <input
                        type="checkbox"
                        checked={useQueue}
                        onChange={(e) => setUseQueue(e.target.checked)}
                      />
                      Use Queue System (Batch Printing)
                    </label>
                    <p className="queue-description">
                      When enabled, labels are queued and printed in batches every 3 seconds.
                      This reduces printer overhead and improves efficiency.
                    </p>
                  </div>
                  
                  {queueStatus.queueSize > 0 && (
                    <div className="queue-actions">
                      <button onClick={clearQueue} className="btn btn-danger btn-sm">
                        Clear Queue ({queueStatus.queueSize})
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="print-section">
                  <h3>Advanced Print Options</h3>
                  <AdvancedPrintOptions
                    onOptionsChange={setPrintOptions}
                    selectedPrinter={selectedPrinter}
                  />
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-tab">
                <PrintJobHistory />
              </div>
            )}
            {activeTab === 'management' && (
              <div className="management-tab">
                <PrintNodeManager 
                  selectedPrinter={selectedPrinter}
                  onSetDefaultPrinter={handleSetDefaultPrinter}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="right-panel">
          <PropertiesPanel 
            selectedElement={selectedElement}
            template={template}
            onTemplateChange={handleTemplateChange}
          />
          
          <div className="template-info">
            <h3>Template Info</h3>
            <p><strong>Name:</strong> {template.name}</p>
            <p><strong>Size:</strong> {template.widthMm}mm × {template.heightMm}mm</p>
            <p><strong>Elements:</strong> {template.elements.length}</p>
            
            <h4>Elements:</h4>
            <ul>
              {template.elements.map((el, i) => (
                <li key={el.id || i}>
                  {el.type}: {el.type === 'text' ? el.text : el.data}
                  (x:{el.x}, y:{el.y})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <PrintPreview 
        template={template}
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
      />
    </div>
  );
}

export default App;
