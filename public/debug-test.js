// Debug script to test what's happening in the browser
console.log('🔍 BOOKVERSE DEBUG TEST STARTING...');

// Test 1: Check configuration
console.log('1. Configuration check:');
console.log('   Config object:', window.__BOOKVERSE_CONFIG__);

// Test 2: Test the HTTP service directly
console.log('2. Testing HTTP service...');
if (window.httpRequest) {
  window.httpRequest('inventory', '/api/v1/books?page=1&per_page=3')
    .then(response => response.json())
    .then(data => {
      console.log('✅ HTTP service working:', data.books?.length, 'books found');
      console.log('   First book:', data.books?.[0]?.title);
    })
    .catch(error => {
      console.error('❌ HTTP service failed:', error);
      console.error('   Error details:', error.message, error.stack);
    });
} else {
  console.error('❌ httpRequest function not found');
}

// Test 3: Test inventory service directly
console.log('3. Testing inventory service directly...');
if (window.listBooks) {
  window.listBooks(1, 3)
    .then(data => {
      console.log('✅ listBooks working:', data.books?.length, 'books found');
    })
    .catch(error => {
      console.error('❌ listBooks failed:', error);
    });
} else {
  console.error('❌ listBooks function not found');
}

// Test 4: Manual fetch test
console.log('4. Manual fetch test...');
fetch('http://localhost:8001/api/v1/books?page=1&per_page=3')
  .then(response => {
    console.log('   Response status:', response.status, response.statusText);
    console.log('   Response headers:', [...response.headers.entries()]);
    return response.json();
  })
  .then(data => {
    console.log('✅ Direct fetch working:', data.books?.length, 'books');
    console.log('   Sample book:', data.books?.[0]?.title);
  })
  .catch(error => {
    console.error('❌ Direct fetch failed:', error);
  });

console.log('🔍 Debug test complete. Check results above.');
