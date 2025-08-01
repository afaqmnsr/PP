#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🔧 PrintNode Setup for OpenTag Label Platform\n');

const envPath = path.join(__dirname, 'backend', '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists in backend directory.');
    rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            createEnvFile();
        } else {
            console.log('Setup cancelled.');
            rl.close();
        }
    });
} else {
    createEnvFile();
}

function createEnvFile() {
    console.log('\n📋 PrintNode API Key Setup');
    console.log('1. Go to https://app.printnode.com/account/apikeys');
    console.log('2. Create a new API key');
    console.log('3. Copy the API key\n');
    
    rl.question('Enter your PrintNode API key: ', (apiKey) => {
        if (!apiKey || apiKey.trim() === '') {
            console.log('❌ API key is required. Setup cancelled.');
            rl.close();
            return;
        }
        
        const envContent = `# PrintNode API Configuration
# Get your API key from: https://app.printnode.com/account/apikeys
PRINTNODE_API_KEY=${apiKey.trim()}

# Server Configuration
PORT=3000
NODE_ENV=development
`;
        
        try {
            fs.writeFileSync(envPath, envContent);
            console.log('\n✅ .env file created successfully!');
            console.log('📍 Location: backend/.env');
            console.log('\n🚀 Next steps:');
            console.log('1. Start the backend server: cd backend && npm start');
            console.log('2. Start the frontend: cd frontend && npm run dev');
            console.log('3. Open the Management tab to verify PrintNode integration');
        } catch (error) {
            console.error('❌ Failed to create .env file:', error.message);
        }
        
        rl.close();
    });
} 