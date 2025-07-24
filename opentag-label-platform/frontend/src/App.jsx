import CanvasDesigner from './components/CanvasDesigner';
import sampleTemplate from './template.json'; // or inline object for now

function App() {
  const template = {
    widthMm: 50,
    heightMm: 25,
    elements: [
      { type: 'text', text: 'Tag 12345', x: 10, y: 10, fontSize: 12 },
      { type: 'qrcode', data: 'https://example.com', x: 35, y: 10, size: 30 }
    ]
  };

  return (
    <div>
      <h1>Label Preview</h1>
      <CanvasDesigner template={template} />
    </div>
  );
}

export default App;
