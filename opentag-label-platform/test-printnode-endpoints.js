#!/usr/bin/env node

const axios = require('axios');

// Test the backend PrintNode endpoints
async function testEndpoints() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('🧪 Testing PrintNode API Endpoints...\n');
    
    const endpoints = [
        { name: 'Printers', url: '/api/printers' },
        { name: 'Computers', url: '/api/computers' },
        { name: 'Account Info', url: '/api/account' },
        { name: 'API Keys (Limited)', url: '/api/account/apikeys' },
        { name: 'Webhooks (Limited)', url: '/api/account/webhooks' },
        { name: 'Print Jobs', url: '/api/print-jobs?limit=10' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`Testing ${endpoint.name}...`);
            const response = await axios.get(`${baseUrl}${endpoint.url}`);
            console.log(`✅ ${endpoint.name}: Success (${response.status})`);
            
            if (Array.isArray(response.data)) {
                console.log(`   📊 Found ${response.data.length} items`);
            } else if (response.data && typeof response.data === 'object') {
                console.log(`   📊 Data received: ${Object.keys(response.data).join(', ')}`);
            }
        } catch (error) {
            console.log(`❌ ${endpoint.name}: Failed (${error.response?.status || 'Network Error'})`);
            if (error.response?.data) {
                if (error.response.status === 403 || error.response.status === 404) {
                    console.log(`   ℹ️  Expected: ${error.response.data.message || error.response.data.error}`);
                } else {
                    console.log(`   🔍 Error: ${JSON.stringify(error.response.data, null, 2)}`);
                }
            }
        }
        console.log('');
    }
}

// Check if backend is running
async function checkBackend() {
    try {
        await axios.get('http://localhost:3000/api/printers');
        console.log('✅ Backend is running');
        return true;
    } catch (error) {
        console.log('❌ Backend is not running. Please start the backend server first:');
        console.log('   cd backend && npm start');
        return false;
    }
}

async function main() {
    console.log('🚀 PrintNode API Endpoint Test\n');
    
    const backendRunning = await checkBackend();
    if (!backendRunning) {
        process.exit(1);
    }
    
    await testEndpoints();
    console.log('🏁 Test completed!');
}

main().catch(console.error); 