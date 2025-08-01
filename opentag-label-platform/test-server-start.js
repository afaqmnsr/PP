import { spawn } from 'child_process';
import path from 'path';

console.log('🧪 Testing server startup...\n');

// Start the server
const serverProcess = spawn('node', ['index.js'], {
    cwd: path.join(process.cwd(), 'backend'),
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('Server output:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
    console.error('Server error:', data.toString());
});

serverProcess.on('close', (code) => {
    console.log(`\nServer process exited with code ${code}`);
    
    if (code === 0) {
        console.log('✅ Server started successfully!');
    } else {
        console.log('❌ Server failed to start');
        console.log('Error output:', errorOutput);
    }
});

// Kill the server after 5 seconds
setTimeout(() => {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill();
}, 5000); 