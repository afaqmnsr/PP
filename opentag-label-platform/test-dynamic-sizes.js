const axios = require('axios');

const testSizes = [
  { name: 'Brady 50x25', width: 50, height: 25 },
  { name: 'Brady 100x25', width: 100, height: 25 },
  { name: 'Brady 50x50', width: 50, height: 50 },
  { name: 'Custom 80x40', width: 80, height: 40 }
];

const testTemplate = {
  name: "Test Label",
  widthMm: 50,
  heightMm: 25,
  elements: [
    {
      id: 'text-1',
      type: 'text',
      text: 'Dynamic Size Test',
      x: 5,
      y: 5,
      fontSize: 8
    }
  ]
};

async function testDynamicSizes() {
  console.log('Testing Dynamic Label Sizes...\n');
  
  for (const size of testSizes) {
    console.log(`Testing ${size.name}...`);
    
    try {
      const updatedTemplate = {
        ...testTemplate,
        name: size.name,
        widthMm: size.width,
        heightMm: size.height
      };
      
      const response = await axios.post('http://localhost:3000/api/render/pdf', updatedTemplate, {
        responseType: 'arraybuffer'
      });
      
      console.log(`✅ ${size.name}: Success (${response.data.length} bytes)`);
      
    } catch (error) {
      console.log(`❌ ${size.name}: Error - ${error.message}`);
    }
  }
}

testDynamicSizes().catch(console.error); 