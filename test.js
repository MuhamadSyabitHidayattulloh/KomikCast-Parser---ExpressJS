const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test functions
async function testEndpoint(name, url) {
    try {
        console.log(`\n🧪 Testing ${name}...`);
        console.log(`📡 URL: ${url}`);
        
        const startTime = Date.now();
        const response = await axios.get(url, { timeout: 30000 });
        const endTime = Date.now();
        
        console.log(`✅ Status: ${response.status}`);
        console.log(`⏱️  Response time: ${endTime - startTime}ms`);
        console.log(`📊 Data length: ${JSON.stringify(response.data).length} characters`);
        
        if (response.data.success !== undefined) {
            console.log(`🎯 Success: ${response.data.success}`);
        }
        
        if (response.data.data && Array.isArray(response.data.data)) {
            console.log(`📚 Items count: ${response.data.data.length}`);
        }
        
        return true;
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.response) {
            console.log(`📄 Status: ${error.response.status}`);
            console.log(`📝 Response: ${JSON.stringify(error.response.data)}`);
        }
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting KomikCast API Tests...');
    console.log('=' .repeat(50));
    
    const tests = [
        { name: 'Root Endpoint', url: `${BASE_URL}/` },
        { name: 'Available Filters', url: `${BASE_URL}/filters` },
        { name: 'Popular Manga', url: `${BASE_URL}/popular?page=1` },
        { name: 'Latest Updates', url: `${BASE_URL}/latest?page=1` },
        { name: 'Search Manga', url: `${BASE_URL}/search?q=naruto&page=1` },
        { name: 'Filter Manga', url: `${BASE_URL}/filter?status=ongoing&type=manga&page=1` }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await testEndpoint(test.name, test.url);
        if (result) {
            passed++;
        } else {
            failed++;
        }
        
        // Wait a bit between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Results:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
}

// Check if server is running
async function checkServer() {
    try {
        await axios.get(`${BASE_URL}/`, { timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
}

async function main() {
    console.log('🔍 Checking if server is running...');
    
    const serverRunning = await checkServer();
    if (!serverRunning) {
        console.log('❌ Server is not running. Please start the server first with: npm start');
        process.exit(1);
    }
    
    console.log('✅ Server is running. Starting tests...');
    await runTests();
}

if (require.main === module) {
    main();
}

module.exports = { testEndpoint, runTests };

