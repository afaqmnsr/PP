import { useState, useEffect } from 'react';
import CanvasDesigner from './components/CanvasDesigner';
import PropertiesPanel from './components/PropertiesPanel';
import TemplateSelector from './components/TemplateSelector';
import PrinterSelector from './components/PrinterSelector';
import PrintJobHistory from './components/PrintJobHistory';
import PrintPreview from './components/PrintPreview';
import ImageUpload from './components/ImageUpload';
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
  const [activeTab, setActiveTab] = useState('design'); // design, templates, printers, history
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load initial printer profiles
    fetch('http://localhost:3000/api/printer-profiles')
      .then(res => res.json())
      .then(profiles => {
        if (profiles.length > 0) {
          setSelectedPrinter(profiles[0].name);
        }
      })
      .catch(err => console.error('Failed to load printer profiles:', err));
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
          printerId: selectedPrinter 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Print job sent! Job ID: ${result.jobId}`);
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

  const handleAddElement = (type) => {
    const newElement = {
      id: `${type}-${Date.now()}`,
      type,
      x: 10,
      y: 10
    };

    if (type === 'text') {
      newElement.text = 'New Text';
      newElement.fontSize = 10;
      newElement.textColor = '#000000';
      newElement.backgroundColor = '#ffffff';
    } else if (type === 'qrcode') {
      newElement.data = 'https://example.com';
      newElement.size = 12;
      newElement.qrColor = '#000000';
      newElement.backgroundColor = '#ffffff';
    } else if (type === 'barcode') {
      newElement.data = '123456789';
      newElement.barcodeType = 'code128';
      newElement.width = 50;
      newElement.height = 10;
      newElement.showText = true;
      newElement.textColor = '#000000';
      newElement.backgroundColor = '#ffffff';
    }

    setTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>OpenTag Label Platform</h1>
        <div className="controls">
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
          </div>

          <div className="tab-content">
            {activeTab === 'design' && (
              <div className="design-tab">
                <div className="element-tools">
                  <h4>Add Elements</h4>
                  <button 
                    onClick={() => handleAddElement('text')}
                    className="btn btn-sm btn-secondary"
                  >
                    + Text
                  </button>
                  <button 
                    onClick={() => handleAddElement('qrcode')}
                    className="btn btn-sm btn-secondary"
                  >
                    + QR Code
                  </button>
                  <button 
                    onClick={() => handleAddElement('barcode')}
                    className="btn btn-sm btn-secondary"
                  >
                    + Barcode
                  </button>
                </div>

                <ImageUpload onImageAdd={handleAddImage} />

                <div className="designer-container">
                  <h3>Label Designer</h3>
                  <CanvasDesigner 
                    template={template} 
                    onTemplateChange={setTemplate}
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
                  onTemplateChange={setTemplate}
                />
              </div>
            )}

            {activeTab === 'printers' && (
              <div className="printers-tab">
                <PrinterSelector 
                  selectedPrinter={selectedPrinter}
                  onPrinterChange={setSelectedPrinter}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-tab">
                <PrintJobHistory />
              </div>
            )}
          </div>
        </div>
        
        <div className="right-panel">
          <PropertiesPanel 
            selectedElement={selectedElement}
            template={template}
            onTemplateChange={setTemplate}
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
