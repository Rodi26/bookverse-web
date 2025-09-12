// BookVerse Release Information Component
export function renderReleaseInfo() {
  return `
    <div id="release-info-modal" class="modal-overlay" style="display: none;">
      <div class="modal-content" style="background: white; padding: 24px; border-radius: 8px; max-width: 600px; margin: 10% auto; position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
        <button id="close-release-info" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">&times;</button>
        
        <h2 style="margin: 0 0 20px 0; color: #2c5aa0;">📊 BookVerse Release Information</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px;">🌐 Web Application</h3>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>Version:</strong> <span id="web-version">Loading...</span></div>
              <div><strong>Image:</strong> <span id="web-image">Loading...</span></div>
              <div><strong>Environment:</strong> <span id="web-env">Loading...</span></div>
              <div><strong>Build Date:</strong> <span id="web-build-date">Loading...</span></div>
            </div>
          </div>
          
          <div>
            <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px;">🏢 Platform Services</h3>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>Platform:</strong> <span id="platform-version">Loading...</span></div>
              <div><strong>Inventory:</strong> <span id="inventory-version">Loading...</span></div>
              <div><strong>Recommendations:</strong> <span id="recommendations-version">Loading...</span></div>
              <div><strong>Checkout:</strong> <span id="checkout-version">Loading...</span></div>
            </div>
          </div>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 16px;">
          <h3 style="margin: 0 0 12px 0; color: #333; font-size: 16px;">🔧 System Information</h3>
          <div style="font-size: 14px; line-height: 1.6;">
            <div><strong>User Agent:</strong> <span id="user-agent">Loading...</span></div>
            <div><strong>Timestamp:</strong> <span id="timestamp">Loading...</span></div>
            <div><strong>Configuration:</strong> <span id="config-status">Loading...</span></div>
          </div>
        </div>
      </div>
    </div>
    
    <div id="release-info-toggle" style="position: fixed; bottom: 20px; left: 20px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 20px; padding: 8px 16px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 1000;">
      📊 Release Info
    </div>
  `;
}

export function initReleaseInfo() {
  // Add the release info to the page
  document.body.insertAdjacentHTML('beforeend', renderReleaseInfo());
  
  // Event listeners
  document.getElementById('release-info-toggle').addEventListener('click', showReleaseInfo);
  document.getElementById('close-release-info').addEventListener('click', hideReleaseInfo);
  
  // Click outside to close
  document.getElementById('release-info-modal').addEventListener('click', (e) => {
    if (e.target.id === 'release-info-modal') {
      hideReleaseInfo();
    }
  });
  
  // Load version information
  loadVersionInfo();
}

function showReleaseInfo() {
  document.getElementById('release-info-modal').style.display = 'block';
  loadVersionInfo(); // Refresh data when opened
}

function hideReleaseInfo() {
  document.getElementById('release-info-modal').style.display = 'none';
}

async function loadVersionInfo() {
  const config = window.__BOOKVERSE_CONFIG__ || {};
  
  // Web application info
  document.getElementById('web-version').textContent = 'v2.1.0 (Circuit Breaker Removed)';
  document.getElementById('web-image').textContent = 'bookverse-web:20-1';
  document.getElementById('web-env').textContent = config.env || 'UNKNOWN';
  document.getElementById('web-build-date').textContent = new Date().toISOString().split('T')[0];
  
  // System info
  document.getElementById('user-agent').textContent = navigator.userAgent.split(' ').slice(0, 3).join(' ') + '...';
  document.getElementById('timestamp').textContent = new Date().toISOString();
  document.getElementById('config-status').textContent = config.inventoryBaseUrl ? 'Configured' : 'Missing URLs';
  
  // Load backend service versions
  await loadBackendVersions(config);
}

async function loadBackendVersions(config) {
  const services = [
    { id: 'platform-version', name: 'Platform', url: config.platformBaseUrl || 'http://localhost:8080' },
    { id: 'inventory-version', name: 'Inventory', url: config.inventoryBaseUrl },
    { id: 'recommendations-version', name: 'Recommendations', url: config.recommendationsBaseUrl },
    { id: 'checkout-version', name: 'Checkout', url: config.checkoutBaseUrl }
  ];
  
  for (const service of services) {
    try {
      if (!service.url) {
        document.getElementById(service.id).textContent = 'Not configured';
        continue;
      }
      
      // Try to get version from health endpoint
      const healthUrl = service.url.includes('health') ? service.url : `${service.url}/health`;
      const response = await fetch(healthUrl, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        timeout: 3000 
      });
      
      if (response.ok) {
        const data = await response.json();
        const version = data.version || data.build_version || 'Online';
        document.getElementById(service.id).textContent = version;
      } else {
        document.getElementById(service.id).textContent = `HTTP ${response.status}`;
      }
    } catch (error) {
      document.getElementById(service.id).textContent = 'Unavailable';
    }
  }
}
