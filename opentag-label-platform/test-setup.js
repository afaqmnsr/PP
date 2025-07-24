#!/usr/bin/env node

/**
 * OpenTag Label Platform - Setup Test Script
 * 
 * This script tests the basic functionality of the platform
 * Run with: node test-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 OpenTag Label Platform - Setup Test\n');

// Test 1: Check file structure
console.log('1. Checking file structure...');
const requiredFiles = [
  'backend/index.js',
  'backend/package.json',
  'frontend/src/App.jsx',
  'frontend/package.json',
  'shared/template.json',
  'README.md'
];

let structureOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    structureOk = false;
  }
});

// Test 2: Check backend dependencies
console.log('\n2. Checking backend dependencies...');
try {
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  const requiredDeps = ['express', 'pdfkit', 'qrcode', 'axios'];
  
  requiredDeps.forEach(dep => {
    if (backendPkg.dependencies && backendPkg.dependencies[dep]) {
      console.log(`   ✅ ${dep} (${backendPkg.dependencies[dep]})`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
      structureOk = false;
    }
  });
} catch (error) {
  console.log('   ❌ Failed to read backend package.json');
  structureOk = false;
}

// Test 3: Check frontend dependencies
console.log('\n3. Checking frontend dependencies...');
try {
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  const requiredDeps = ['react', 'react-konva', 'qrcode'];
  
  requiredDeps.forEach(dep => {
    if (frontendPkg.dependencies && frontendPkg.dependencies[dep]) {
      console.log(`   ✅ ${dep} (${frontendPkg.dependencies[dep]})`);
    } else {
      console.log(`   ❌ ${dep} - MISSING`);
      structureOk = false;
    }
  });
} catch (error) {
  console.log('   ❌ Failed to read frontend package.json');
  structureOk = false;
}

// Test 4: Check template format
console.log('\n4. Checking template format...');
try {
  const template = JSON.parse(fs.readFileSync('shared/template.json', 'utf8'));
  
  if (template.name && template.widthMm && template.heightMm && template.elements) {
    console.log('   ✅ Template structure is valid');
    console.log(`   📏 Size: ${template.widthMm}×${template.heightMm}mm`);
    console.log(`   🧩 Elements: ${template.elements.length}`);
  } else {
    console.log('   ❌ Template structure is invalid');
    structureOk = false;
  }
} catch (error) {
  console.log('   ❌ Failed to read template.json');
  structureOk = false;
}

// Test 5: Check environment setup
console.log('\n5. Checking environment setup...');
if (fs.existsSync('backend/.env')) {
  console.log('   ✅ .env file exists');
} else {
  console.log('   ⚠️  .env file not found - you\'ll need to create it');
  console.log('   📝 Add: PRINTNODE_API_KEY=your_api_key_here');
}

// Summary
console.log('\n📊 Test Summary');
if (structureOk) {
  console.log('✅ All basic tests passed!');
  console.log('\n🚀 Next steps:');
  console.log('1. cd backend && npm install');
  console.log('2. cd frontend && npm install');
  console.log('3. Add your PrintNode API key to backend/.env');
  console.log('4. Start backend: cd backend && node index.js');
  console.log('5. Start frontend: cd frontend && npm run dev');
  console.log('6. Open http://localhost:5173 in your browser');
} else {
  console.log('❌ Some tests failed. Please check the issues above.');
  console.log('\n🔧 To fix:');
  console.log('1. Run: npm install in both backend and frontend directories');
  console.log('2. Check that all required files exist');
  console.log('3. Verify package.json files are valid');
}

console.log('\n📚 For more help, see README.md'); 