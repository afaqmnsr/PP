import { readFileSync } from 'fs';
import { join } from 'path';

const files = [
    'backend/index.js',
    'backend/queueManager.js',
    'backend/pdfGenerator.js',
    'backend/printNodeService.js'
];

console.log('🔍 Checking syntax of backend files...\n');

let allGood = true;

for (const file of files) {
    try {
        const content = readFileSync(file, 'utf8');
        
        // Try to parse the file as a module
        const module = new Function('import', content);
        
        console.log(`✅ ${file} - Syntax OK`);
    } catch (error) {
        console.error(`❌ ${file} - Syntax Error:`);
        console.error(`   ${error.message}`);
        allGood = false;
    }
}

if (allGood) {
    console.log('\n🎉 All files have valid syntax!');
} else {
    console.log('\n💥 Some files have syntax errors.');
} 