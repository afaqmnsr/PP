import { useState } from 'react';

const PREDEFINED_SIZES = [
  { name: 'Brady 50x25', width: 50, height: 25, description: 'Standard small label' },
  { name: 'Brady 100x25', width: 100, height: 25, description: 'Wide small label' },
  { name: 'Brady 50x50', width: 50, height: 50, description: 'Square label' },
  { name: 'Brady 100x50', width: 100, height: 50, description: 'Wide medium label' },
  { name: 'Brady 100x75', width: 100, height: 75, description: 'Large label' },
  { name: 'Brady 150x50', width: 150, height: 50, description: 'Extra wide label' },
  { name: 'Brady 150x100', width: 150, height: 100, description: 'Large wide label' },
  { name: 'Custom', width: null, height: null, description: 'Custom dimensions' }
];

export default function LabelSizeSelector({ template, onTemplateChange }) {
  const [showCustom, setShowCustom] = useState(false);
  const [customWidth, setCustomWidth] = useState(template.widthMm || 50);
  const [customHeight, setCustomHeight] = useState(template.heightMm || 25);

  const handleSizeChange = (size) => {
    if (size.name === 'Custom') {
      setShowCustom(true);
      return;
    }

    setShowCustom(false);
    const updatedTemplate = {
      ...template,
      name: size.name,
      widthMm: size.width,
      heightMm: size.height
    };
    onTemplateChange(updatedTemplate);
  };

  const handleCustomSizeChange = () => {
    const updatedTemplate = {
      ...template,
      name: `Custom ${customWidth}x${customHeight}`,
      widthMm: customWidth,
      heightMm: customHeight
    };
    onTemplateChange(updatedTemplate);
  };

  const getCurrentSize = () => {
    return PREDEFINED_SIZES.find(size => 
      size.width === template.widthMm && size.height === template.heightMm
    ) || PREDEFINED_SIZES[PREDEFINED_SIZES.length - 1]; // Custom
  };

  return (
    <div className="label-size-selector">
      <h4>Label Size</h4>
      <div className="size-selector">
        <select 
          value={getCurrentSize().name}
          onChange={(e) => {
            const selectedSize = PREDEFINED_SIZES.find(size => size.name === e.target.value);
            handleSizeChange(selectedSize);
          }}
          className="size-dropdown"
        >
          {PREDEFINED_SIZES.map(size => (
            <option key={size.name} value={size.name}>
              {size.name} ({size.width || '?'}x{size.height || '?'}mm)
            </option>
          ))}
        </select>
        
        <div className="current-size-info">
          <span className="size-display">
            Current: {template.widthMm} × {template.heightMm} mm
          </span>
        </div>
      </div>

      {showCustom && (
        <div className="custom-size-inputs">
          <div className="input-group">
            <label>Width (mm):</label>
            <input
              type="number"
              value={customWidth}
              onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 10)}
              min="10"
              max="200"
              step="1"
            />
          </div>
          <div className="input-group">
            <label>Height (mm):</label>
            <input
              type="number"
              value={customHeight}
              onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 10)}
              min="10"
              max="200"
              step="1"
            />
          </div>
          <button 
            onClick={handleCustomSizeChange}
            className="btn btn-primary btn-sm"
          >
            Apply Custom Size
          </button>
        </div>
      )}

      <div className="size-presets">
        <h5>Quick Presets:</h5>
        <div className="preset-buttons">
          {PREDEFINED_SIZES.slice(0, -1).map(size => (
            <button
              key={size.name}
              onClick={() => handleSizeChange(size)}
              className={`preset-btn ${template.widthMm === size.width && template.heightMm === size.height ? 'active' : ''}`}
              title={size.description}
            >
              {size.width}×{size.height}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 