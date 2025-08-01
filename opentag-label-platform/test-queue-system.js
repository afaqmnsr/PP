import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// Test template
const testTemplate = {
    name: 'Test Label',
    widthMm: 50,
    heightMm: 25,
    elements: [
        {
            id: 'text-1',
            type: 'text',
            text: 'Test Label',
            x: 5,
            y: 5,
            fontSize: 12,
            textColor: '#000000'
        },
        {
            id: 'qr-1',
            type: 'qrcode',
            data: 'https://example.com/test',
            x: 30,
            y: 5,
            size: 15
        }
    ]
};

async function testQueueSystem() {
    console.log('🧪 Testing Queue System...\n');

    try {
        // Test 1: Check initial queue status
        console.log('1. Checking initial queue status...');
        const statusResponse = await axios.get(`${BASE_URL}/api/queue/status`);
        console.log('   Queue status:', statusResponse.data);

        // Test 2: Add label to queue
        console.log('\n2. Adding label to queue...');
        const printResponse = await axios.post(`${BASE_URL}/api/print`, {
            template: testTemplate,
            printerId: '1',
            printOptions: {
                title: 'Test Queue Label',
                source: 'Queue Test'
            },
            useQueue: true
        });
        console.log('   Print response:', printResponse.data);

        // Test 3: Check queue status after adding
        console.log('\n3. Checking queue status after adding...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        const statusAfterResponse = await axios.get(`${BASE_URL}/api/queue/status`);
        console.log('   Queue status after adding:', statusAfterResponse.data);

        // Test 4: Wait for queue processing (should happen after 3 seconds)
        console.log('\n4. Waiting for queue processing (3 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait 4 seconds

        // Test 5: Check final queue status
        console.log('\n5. Checking final queue status...');
        const finalStatusResponse = await axios.get(`${BASE_URL}/api/queue/status`);
        console.log('   Final queue status:', finalStatusResponse.data);

        console.log('\n✅ Queue system test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test immediate printing (no queue)
async function testImmediatePrint() {
    console.log('\n🧪 Testing Immediate Print (No Queue)...\n');

    try {
        const printResponse = await axios.post(`${BASE_URL}/api/print`, {
            template: testTemplate,
            printerId: '1',
            printOptions: {
                title: 'Test Immediate Label',
                source: 'Immediate Test'
            },
            useQueue: false
        });
        console.log('   Immediate print response:', printResponse.data);
        console.log('✅ Immediate print test completed!');

    } catch (error) {
        console.error('❌ Immediate print test failed:', error.response?.data || error.message);
    }
}

// Test PDF generation
async function testPDFGeneration() {
    console.log('\n🧪 Testing PDF Generation...\n');

    try {
        const pdfResponse = await axios.post(`${BASE_URL}/api/render-pdf`, {
            template: testTemplate
        }, {
            responseType: 'arraybuffer'
        });
        
        console.log('   PDF generated successfully!');
        console.log('   PDF size:', pdfResponse.data.byteLength, 'bytes');
        console.log('✅ PDF generation test completed!');

    } catch (error) {
        console.error('❌ PDF generation test failed:', error.response?.data || error.message);
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting OpenTag Label Platform Tests\n');
    
    await testPDFGeneration();
    await testQueueSystem();
    await testImmediatePrint();
    
    console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { testQueueSystem, testImmediatePrint, testPDFGeneration }; 