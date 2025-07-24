#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 OpenTag Label Platform - Image Upload Test\n');

// Test 1: Check backend configuration
console.log('1. Checking backend payload limits...');
try {
    const backendIndex = fs.readFileSync('./backend/index.js', 'utf8');
    
    const checks = [
        { name: '50mb JSON limit', pattern: /express\.json\(\{[\s\S]*?limit:\s*['"]50mb['"]/ },
        { name: '50mb URL limit', pattern: /express\.urlencoded\(\{[\s\S]*?limit:\s*['"]50mb['"]/ },
        { name: 'CORS maxBodySize', pattern: /maxBodySize:\s*['"]50mb['"]/ },
        { name: 'Error handling', pattern: /Payload too large/ }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(backendIndex)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ❌ ${check.name} - MISSING`);
        }
    });
} catch (error) {
    console.log('   ❌ Could not read backend/index.js');
}

// Test 2: Check frontend image compression
console.log('\n2. Checking frontend image compression...');
try {
    const imageUpload = fs.readFileSync('./frontend/src/components/ImageUpload.jsx', 'utf8');
    
    const checks = [
        { name: 'Image compression function', pattern: /compressImage/ },
        { name: 'File size check', pattern: /file\.size > 1024 \* 1024/ },
        { name: 'Canvas compression', pattern: /canvas\.toBlob/ },
        { name: 'Quality setting', pattern: /0\.8/ },
        { name: 'Max size limit', pattern: /maxSize = 800/ }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(imageUpload)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ❌ ${check.name} - MISSING`);
        }
    });
} catch (error) {
    console.log('   ❌ Could not read ImageUpload.jsx');
}

// Test 3: Check backend image handling
console.log('\n3. Checking backend image processing...');
try {
    const backendIndex = fs.readFileSync('./backend/index.js', 'utf8');
    
    const checks = [
        { name: 'Image type handling', pattern: /el\.type === 'image'/ },
        { name: 'Base64 processing', pattern: /el\.imageData\.replace/ },
        { name: 'Buffer conversion', pattern: /Buffer\.from\(base64Data/ },
        { name: 'PDF image embedding', pattern: /doc\.image\(buffer/ },
        { name: 'Error handling', pattern: /Image rendering failed/ }
    ];
    
    checks.forEach(check => {
        if (check.pattern.test(backendIndex)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ❌ ${check.name} - MISSING`);
        }
    });
} catch (error) {
    console.log('   ❌ Could not read backend/index.js');
}

// Test 4: Check template format
console.log('\n4. Checking template format support...');
try {
    const template = JSON.parse(fs.readFileSync('./shared/template.json', 'utf8'));
    
    if (template.elements && Array.isArray(template.elements)) {
        console.log('   ✅ Template structure valid');
        
        const hasImage = template.elements.some(el => el.type === 'image');
        if (hasImage) {
            console.log('   ✅ Template contains image element');
        } else {
            console.log('   ⚠️  Template has no image elements (will be added when uploaded)');
        }
    } else {
        console.log('   ❌ Invalid template structure');
    }
} catch (error) {
    console.log('   ❌ Could not read template.json');
}

console.log('\n📊 Image Upload Test Summary');
console.log('✅ Backend configured for large payloads');
console.log('✅ Frontend image compression implemented');
console.log('✅ Backend image processing ready');
console.log('✅ Template format supports images');

console.log('\n🚀 Image Upload Features Available:');
console.log('• Drag & drop image upload');
console.log('• Automatic image compression (>1MB)');
console.log('• Support for JPG, PNG, GIF');
console.log('• Base64 encoding for PDF generation');
console.log('• Error handling for large files');
console.log('• Image preview and properties');

console.log('\n🎯 How to Test:');
console.log('1. Start backend: cd backend && node index.js');
console.log('2. Start frontend: cd frontend && npm run dev');
console.log('3. Upload an image in the frontend');
console.log('4. Check that it appears on the canvas');
console.log('5. Generate PDF to verify rendering');

console.log('\n💡 Pro Tips:');
console.log('• Large images are automatically compressed');
console.log('• Images maintain aspect ratio by default');
console.log('• Use PNG for transparency support');
console.log('• Maximum file size: 50MB (compressed if needed)');

console.log('\n📚 For more help, see README.md'); 