# OpenTag Label Platform

A comprehensive label design and printing platform with advanced features for creating, managing, and printing labels with various elements including text, QR codes, barcodes, images, and shapes.

## 🚀 Features

### Core Functionality
- **Interactive Label Designer**: Drag-and-drop canvas with real-time editing
- **Multiple Element Types**: Text, QR codes, barcodes, images, rectangles, circles, lines
- **Dynamic Label Sizing**: Support for various label dimensions with automatic element scaling
- **Template Management**: Save, load, and manage label templates
- **Print Preview**: Real-time PDF preview with zoom controls
- **Dark Mode**: Complete dark theme support

### Advanced Printing
- **Queue System**: Batch printing with 3-second debounce for efficiency
- **PrintNode Integration**: Full PrintNode API support for printer management
- **Advanced Print Options**: Duplex, orientation, media, DPI, copies, and more
- **Printer Management**: View printers, capabilities, and set default printers
- **Print Job History**: Monitor and manage print jobs

### Element Features
- **Multi-Select**: Select multiple elements for batch operations
- **Grouping**: Group and ungroup elements for easier management
- **Grid Snapping**: Precise element placement with grid alignment
- **Layering**: Bring elements to front or send to back
- **Properties Panel**: Real-time editing of element properties

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PrintNode account and API key (for printing functionality)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/afaqmnsr/PP.git
   cd PP/opentag-label-platform
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **PrintNode Setup**
   ```bash
   # Option 1: Use the setup script (recommended)
   node setup-printnode.js
   
   # Option 2: Manual setup
   # Create .env file in backend directory
   cd backend
   echo "PRINTNODE_API_KEY=your_api_key_here" > .env
   ```
   
   **Getting a PrintNode API Key:**
   1. Go to [PrintNode API Keys](https://app.printnode.com/account/apikeys)
   2. Create a new API key
   3. Copy the key and add it to your `.env` file

4. **Start the application**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory, in new terminal)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `backend` directory:

```env
PRINTNODE_API_KEY=your_printnode_api_key_here
PORT=3000
```

### PrintNode API Key
The PrintNode API key is required for:
- Viewing available printers
- Sending print jobs
- Managing print job history
- Viewing printer capabilities

## 📖 Usage

### Creating Labels
1. **Design Tab**: Use the interactive canvas to add elements
2. **Element Toolbar**: Click buttons to add text, QR codes, barcodes, images, or shapes
3. **Properties Panel**: Select elements to edit their properties
4. **Label Size**: Use the label size selector to change dimensions

### Printing Labels
1. **Printer Selection**: Choose a printer from the available list
2. **Queue System**: Enable/disable the queue system for batch printing
3. **Advanced Options**: Configure print options like copies, orientation, etc.
4. **Print**: Click "Print Label" to send to printer

### Queue System
The queue system provides efficient batch printing:
- **Automatic Batching**: Labels are queued and printed every 3 seconds
- **Status Monitoring**: Real-time queue status display
- **Manual Control**: Clear queue or disable queue system
- **Efficiency**: Reduces printer overhead for multiple labels

### Template Management
1. **Save Templates**: Save current design as a template
2. **Load Templates**: Select and load saved templates
3. **Template Library**: Manage multiple template designs

## 🧪 Testing

### Test the Queue System
```bash
# From the root directory
node test-queue-system.js
```

### Test PrintNode Integration
```bash
# From the root directory
node test-printnode-endpoints.js
```

## 📁 Project Structure

```
opentag-label-platform/
├── backend/
│   ├── index.js              # Main server file
│   ├── queueManager.js       # Queue system management
│   ├── pdfGenerator.js       # PDF generation service
│   ├── printNodeService.js   # PrintNode API integration
│   ├── package.json
│   └── .env                  # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── components/       # React components
│   │   │   ├── CanvasDesigner.jsx
│   │   │   ├── PropertiesPanel.jsx
│   │   │   ├── PrintNodeManager.jsx
│   │   │   └── ...
│   │   └── App.css           # Styles
│   └── package.json
├── shared/                   # Shared templates and data
├── templates/                # Saved label templates
└── README.md
```

## 🔌 API Endpoints

### Core Endpoints
- `POST /api/render-pdf` - Generate PDF preview
- `POST /api/print` - Print label (with queue support)
- `GET /api/templates` - Get saved templates
- `POST /api/templates` - Save template

### Queue Management
- `GET /api/queue/status` - Get queue status
- `POST /api/queue/clear` - Clear queue

### PrintNode Integration
- `GET /api/printers` - Get available printers
- `GET /api/printers/:id` - Get printer details
- `GET /api/printers/:id/capabilities` - Get printer capabilities
- `GET /api/print-jobs` - Get print job history
- `DELETE /api/print-jobs/:id` - Cancel print job
- `GET /api/computers` - Get PrintNode computers

## 🎨 Element Types

### Text Elements
- Font size, color, alignment
- Background color
- Text content editing

### QR Codes
- Data content
- Size and color customization
- Error correction levels

### Barcodes
- Multiple formats (Code128, EAN13, etc.)
- Size and text display options
- Data content

### Images
- Upload and display images
- Size and positioning
- Base64 encoding support

### Shapes
- Rectangles with fill/stroke
- Circles with customizable radius
- Lines with stroke properties

## 🐛 Troubleshooting

### Common Issues

**PrintNode API key not configured**
- Ensure `PRINTNODE_API_KEY` is set in `.env` file
- Restart the backend server after adding the key

**Queue not processing**
- Check queue status via `/api/queue/status`
- Verify PrintNode API key is valid
- Check printer connectivity

**PDF generation errors**
- Ensure all element data is valid
- Check image file sizes (max 50MB)
- Verify label dimensions are reasonable

**Account management limitations**
- API key management requires parent account authentication
- Webhook endpoints are not available in current PrintNode API
- Use PrintNode web interface for account management features

### Debug Mode
Enable debug logging by setting environment variables:
```env
DEBUG=true
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

### v2.2.0 - Queue System & Enhanced PDF Generation
- ✅ **Queue System**: Implemented batch printing with 3-second debounce
- ✅ **Enhanced PDF Generation**: Modular PDF generation service
- ✅ **PrintNode Service**: Dedicated PrintNode API integration
- ✅ **Queue Management**: Real-time queue status and controls
- ✅ **Batch Processing**: Automatic merging of multiple labels into single PDF
- ✅ **Improved Error Handling**: Better error messages and fallbacks

### v2.1.0 - PrintNode Integration & Default Printer
- ✅ **Default Printer Selection**: Set and save default printer in localStorage
- ✅ **PrintNode API Integration**: Full PrintNode API support
- ✅ **Printer Management**: View printers, capabilities, and status
- ✅ **Print Job History**: Monitor and manage print jobs
- ✅ **Advanced Print Options**: Configure print job parameters

### v2.0.0 - Multi-Element Support & Dynamic Sizing
- ✅ **Multiple Element Types**: Text, QR, barcode, image, rectangle, circle, line
- ✅ **Dynamic Label Sizing**: Change label dimensions with automatic scaling
- ✅ **Interactive Designer**: Drag, resize, rotate, multi-select, grouping
- ✅ **Properties Panel**: Real-time element property editing
- ✅ **Template Management**: Save and load label templates

## 📞 Support

For support and questions:
- **Email**: afaqmnsr0@gmail.com
- **GitHub**: [https://github.com/afaqmnsr/PP](https://github.com/afaqmnsr/PP)

## 📄 License

This project is licensed under the ISC License.

---

**OpenTag Label Platform** - Professional label design and printing solution 