// BookVerse Debug Panel - Add to Release Info Window
(function() {
  // Wait for the page to load
  setTimeout(function() {
    // Find the release info modal or create debug button
    const releaseInfo = document.querySelector('[id*="release"], [class*="release"], .modal');
    
    if (releaseInfo) {
      // Add debug section to existing release info
      const debugSection = document.createElement('div');
      debugSection.innerHTML = `
        <div style="border-top: 1px solid #ddd; margin-top: 16px; padding-top: 16px;">
          <h3 style="color: #dc3545; margin: 0 0 12px 0;">🛠️ Debug Tools</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <button id="fix-circuit-breaker" style="padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              🔧 Fix Circuit Breaker
            </button>
            <button id="test-apis" style="padding: 8px 12px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              🧪 Test APIs
            </button>
            <button id="force-reload-books" style="padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
              🔄 Force Reload Books
            </button>
            <div id="debug-output" style="margin-top: 8px; padding: 8px; background: #f8f9fa; border-radius: 4px; font-family: monospace; font-size: 12px; max-height: 100px; overflow-y: auto; display: none;"></div>
          </div>
        </div>
      `;
      releaseInfo.appendChild(debugSection);
      
      // Add event listeners
      document.getElementById('fix-circuit-breaker').addEventListener('click', function() {
        showDebugOutput('🔧 Fixing circuit breaker...');
        setTimeout(() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload(true);
        }, 500);
      });
      
      document.getElementById('test-apis').addEventListener('click', async function() {
        const output = document.getElementById('debug-output');
        output.style.display = 'block';
        output.innerHTML = '🧪 Testing APIs...<br>';
        
        const config = window.__BOOKVERSE_CONFIG__ || {};
        
        try {
          // Test inventory
          const invResponse = await fetch(config.inventoryBaseUrl + '/api/v1/books?page=1&per_page=1');
          output.innerHTML += `✅ Inventory: ${invResponse.ok ? 'Working' : 'Failed (' + invResponse.status + ')'}<br>`;
          
          // Test recommendations  
          const recResponse = await fetch(config.recommendationsBaseUrl + '/api/v1/recommendations/trending?limit=1');
          output.innerHTML += `✅ Recommendations: ${recResponse.ok ? 'Working' : 'Failed (' + recResponse.status + ')'}<br>`;
          
          // Test checkout
          const checkResponse = await fetch(config.checkoutBaseUrl + '/health');
          output.innerHTML += `✅ Checkout: ${checkResponse.ok ? 'Working' : 'Failed (' + checkResponse.status + ')'}<br>`;
          
          output.innerHTML += '<br>📊 Config:<br>' + JSON.stringify(config, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
          
        } catch (error) {
          output.innerHTML += `❌ Error: ${error.message}<br>`;
        }
      });
      
      document.getElementById('force-reload-books').addEventListener('click', function() {
        showDebugOutput('🔄 Force reloading books...');
        
        // Use the working book loading code
        const app = document.getElementById('app');
        if (app) {
          // Apply the fix from before
          window.fixedListBooks = async function(page = 1, perPage = 10) {
            const baseUrl = window.__BOOKVERSE_CONFIG__?.inventoryBaseUrl || 'http://localhost:8001';
            const response = await fetch(`${baseUrl}/api/v1/books?page=${page}&per_page=${perPage}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
          };
          
          app.innerHTML = '<div style="text-align: center; padding: 50px;"><h2>🔄 Reloading books...</h2></div>';
          
          setTimeout(async () => {
            try {
              const data = await window.fixedListBooks(1, 50);
              showDebugOutput(`✅ Loaded ${data.books.length} books! Refreshing page...`);
              setTimeout(() => window.location.reload(), 1000);
            } catch (error) {
              showDebugOutput(`❌ Failed: ${error.message}`);
            }
          }, 1000);
        }
      });
      
      function showDebugOutput(message) {
        const output = document.getElementById('debug-output');
        output.style.display = 'block';
        output.innerHTML = message;
      }
      
      console.log('🛠️ BookVerse Debug Panel Added to Release Info');
    } else {
      // If no release info found, create a floating debug button
      const debugButton = document.createElement('div');
      debugButton.innerHTML = '🛠️';
      debugButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 40px;
        height: 40px;
        background: #dc3545;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9999;
        font-size: 18px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      `;
      debugButton.title = 'Debug Tools';
      debugButton.onclick = () => {
        if (confirm('Fix BookVerse circuit breaker?')) {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload(true);
        }
      };
      document.body.appendChild(debugButton);
      console.log('🛠️ BookVerse Debug Button Added (floating)');
    }
  }, 2000);

  // Add keyboard shortcut: Ctrl+Shift+F to fix
  document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.shiftKey && e.key === "F") {
      console.log("🔧 Debug shortcut triggered!");
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload(true);
    }
  });
})();
