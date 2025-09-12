// BookVerse Release Information Component
export function renderReleaseInfo() {
  return `
    <div id="release-info-modal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: var(--panel); color: var(--text); padding: 32px; border-radius: 12px; max-width: 700px; margin: 0 20px; position: relative; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-height: 80vh; overflow-y: auto;">
        <button id="close-release-info" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--muted); font-weight: bold;">&times;</button>
        
        <h2 style="margin: 0 0 24px 0; color: var(--brand); font-size: 24px;">📊 BookVerse Release Information</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
          <div style="background: var(--bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border);">
            <h3 style="margin: 0 0 16px 0; color: var(--text); font-size: 16px; font-weight: 600;">🌐 Web Application</h3>
            <div style="font-size: 14px; line-height: 1.8; color: var(--text);">
              <div><strong style="color: var(--brand);">Version:</strong> <span id="web-version" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Image:</strong> <span id="web-image" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Environment:</strong> <span id="web-env" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Last Updated:</strong> <span id="version-changed" style="color: var(--text);">Loading...</span></div>
            </div>
          </div>
          
          <div style="background: var(--bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border);">
            <h3 style="margin: 0 0 16px 0; color: var(--text); font-size: 16px; font-weight: 600;">🏢 Platform Services</h3>
            <div style="font-size: 14px; line-height: 1.8; color: var(--text);">
              <div><strong style="color: var(--brand);">Platform:</strong> <span id="platform-version" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Inventory:</strong> <span id="inventory-version" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Recommendations:</strong> <span id="recommendations-version" style="color: var(--text);">Loading...</span></div>
              <div><strong style="color: var(--brand);">Checkout:</strong> <span id="checkout-version" style="color: var(--text);">Loading...</span></div>
            </div>
          </div>
        </div>
        
        <div style="background: var(--bg); padding: 20px; border-radius: 8px; border: 1px solid var(--border);">
          <h3 style="margin: 0 0 16px 0; color: var(--text); font-size: 16px; font-weight: 600;">🔧 System Information</h3>
          <div style="font-size: 14px; line-height: 1.8; color: var(--text);">
            <div><strong style="color: var(--brand);">Uptime:</strong> <span id="uptime" style="color: var(--text);">Loading...</span></div>
            <div><strong style="color: var(--brand);">Browser:</strong> <span id="user-agent" style="color: var(--text);">Loading...</span></div>
            <div><strong style="color: var(--brand);">Current Time:</strong> <span id="timestamp" style="color: var(--text);">Loading...</span></div>
            <div><strong style="color: var(--brand);">Configuration Status:</strong> <span id="config-status" style="color: var(--text);">Loading...</span></div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 24px;">
          <button id="release-close-btn" style="background: var(--brand); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Close</button>
        </div>
      </div>
    </div>
    
    <div id="release-info-toggle" style="position: fixed; bottom: 20px; left: 20px; background: var(--brand); color: white; border: none; border-radius: 50px; padding: 12px 20px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); z-index: 1000; transition: transform 0.2s ease;">
      📊 Release Info
    </div>
  `;
}

export function initReleaseInfo() {
  // Store the startup time
  window.__BOOKVERSE_STARTUP_TIME__ = Date.now();
  
  // Add the release info to the page
  document.body.insertAdjacentHTML('beforeend', renderReleaseInfo());
  
  // Event listeners
  document.getElementById('release-info-toggle').addEventListener('click', showReleaseInfo);
  document.getElementById('close-release-info').addEventListener('click', hideReleaseInfo);
  document.getElementById('release-close-btn').addEventListener('click', hideReleaseInfo);
  
  // Click outside to close
  document.getElementById('release-info-modal').addEventListener('click', (e) => {
    if (e.target.id === 'release-info-modal') {
      hideReleaseInfo();
    }
  });
  
  // Hover effect for toggle button
  const toggle = document.getElementById('release-info-toggle');
  toggle.addEventListener('mouseenter', () => toggle.style.transform = 'scale(1.05)');
  toggle.addEventListener('mouseleave', () => toggle.style.transform = 'scale(1)');
  
  // Load version information
  loadVersionInfo();
}

function showReleaseInfo() {
  document.getElementById('release-info-modal').style.display = 'flex';
  loadVersionInfo(); // Refresh data when opened
}

function hideReleaseInfo() {
  document.getElementById('release-info-modal').style.display = 'none';
}

async function loadVersionInfo() {
  const config = window.__BOOKVERSE_CONFIG__ || {};
  
  // Calculate uptime
  const startTime = window.__BOOKVERSE_STARTUP_TIME__ || Date.now();
  const uptimeMs = Date.now() - startTime;
  const uptimeMinutes = Math.floor(uptimeMs / 60000);
  const uptimeSeconds = Math.floor((uptimeMs % 60000) / 1000);
  const uptimeText = uptimeMinutes > 0 ? `${uptimeMinutes}m ${uptimeSeconds}s` : `${uptimeSeconds}s`;
  
  // Web application info
  document.getElementById('web-version').textContent = 'v2.2.0 (UI Improvements + Circuit Breaker Removed)';
  document.getElementById('web-image').textContent = 'bookverse-web:latest';
  document.getElementById('web-env').textContent = config.env || 'UNKNOWN';
  document.getElementById('version-changed').textContent = 'September 12, 2025 - Today';
  
  // System info
  document.getElementById('uptime').textContent = uptimeText;
  document.getElementById('user-agent').textContent = navigator.userAgent.split(' ').slice(-2).join(' ');
  document.getElementById('timestamp').textContent = new Date().toLocaleString();
  document.getElementById('config-status').textContent = config.inventoryBaseUrl ? '✅ All Services Configured' : '❌ Missing Service URLs';
  
  // Load backend service versions
  await loadBackendVersions(config);
}

async function loadBackendVersions(config) {
  const services = [
    { id: 'platform-version', name: 'Platform', url: 'http://localhost:8080', healthPath: '/health' },
    { id: 'inventory-version', name: 'Inventory', url: config.inventoryBaseUrl, healthPath: '/health' },
    { id: 'recommendations-version', name: 'Recommendations', url: config.recommendationsBaseUrl, healthPath: '/health' },
    { id: 'checkout-version', name: 'Checkout', url: config.checkoutBaseUrl, healthPath: '/health' }
  ];
  
  for (const service of services) {
    try {
      if (!service.url) {
        document.getElementById(service.id).textContent = 'Not configured';
        continue;
      }
      
      // Try to get version from health endpoint
      const healthUrl = `${service.url}${service.healthPath}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(healthUrl, { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        let version = 'Online';
        
        // Extract version from different possible fields
        if (data.version) {
          version = data.version;
        } else if (data.build_version) {
          version = data.build_version;
        } else if (data.service) {
          version = `${data.service} - ${data.status || 'Running'}`;
        } else if (data.status) {
          version = `${data.status === 'ok' || data.status === 'healthy' ? '✅' : '⚠️'} ${data.status}`;
        }
        
        document.getElementById(service.id).textContent = version;
      } else {
        document.getElementById(service.id).textContent = `HTTP ${response.status}`;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        document.getElementById(service.id).textContent = 'Timeout';
      } else {
        document.getElementById(service.id).textContent = 'Connection Failed';
      }
    }
  }
}
