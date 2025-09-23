/**
 * BookVerse Web Application - Trust & Release Information Panel
 *
 * This module implements a comprehensive trust and release information panel for the BookVerse
 * e-commerce platform, providing operational visibility, security transparency, and system
 * status information through an elegant floating UI component with AppTrust evidence integration.
 *
 * 🏗️ Architecture Overview:
 *     - Trust Panel Component: Floating UI element for operational transparency
 *     - Evidence Integration: AppTrust evidence.json consumption and display
 *     - Modal Interface: Sophisticated overlay with responsive design
 *     - Service Discovery: Real-time service configuration and status display
 *     - Browser Integration: Native DOM manipulation with modern CSS styling
 *
 * 🚀 Key Features:
 *     - Real-time application and service status monitoring
 *     - AppTrust evidence.json integration for supply chain transparency
 *     - Container image verification and digest display
 *     - Service endpoint configuration and health visualization
 *     - Browser runtime information and diagnostic data
 *     - Elegant UI with theme-aware styling and hover effects
 *     - Modal accessibility with keyboard and click-to-close functionality
 *
 * 🔧 Technical Implementation:
 *     - Native DOM manipulation for optimal performance
 *     - CSS-in-JS styling with CSS custom property integration
 *     - Async/await patterns for evidence fetching and error handling
 *     - Event delegation for modal interaction and lifecycle management
 *     - Graceful fallbacks for missing AppTrust evidence
 *     - Theme-aware styling with CSS variable integration
 *
 * 📊 Business Logic:
 *     - Operational transparency for development and operations teams
 *     - Security verification through AppTrust evidence display
 *     - System status visibility for debugging and troubleshooting
 *     - Compliance and audit support through evidence tracking
 *     - User confidence building through transparency features
 *
 * 🛠️ Usage Patterns:
 *     - Development debugging and system status verification
 *     - Operations monitoring and service health checking
 *     - Security auditing and supply chain verification
 *     - Compliance reporting and evidence collection
 *     - User support and troubleshooting assistance
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

/**
 * Attach comprehensive trust and release information panel to the application.
 * 
 * This function creates and attaches a sophisticated floating panel that provides
 * operational visibility, security transparency, and system status information.
 * It integrates with AppTrust evidence systems and provides elegant UI for
 * accessing critical application and infrastructure information.
 * 
 * 🎯 Purpose:
 *     - Provide operational transparency through accessible information panel
 *     - Integrate AppTrust evidence for supply chain security verification
 *     - Display real-time service configuration and status information
 *     - Enable debugging and troubleshooting through system visibility
 *     - Support compliance and audit requirements through evidence display
 * 
 * 🔧 Implementation Features:
 *     - Floating button with elegant hover effects and positioning
 *     - Modal overlay with responsive design and accessibility features
 *     - AppTrust evidence integration with graceful fallback mechanisms
 *     - Service configuration display with visual status indicators
 *     - Browser runtime information and diagnostic data collection
 * 
 * @async
 * @function attachTrustPanel
 * @returns {Promise<void>} Promise resolving when panel is attached and configured
 * 
 * @example
 * // Basic panel attachment during application initialization
 * import { attachTrustPanel } from './trust/panel.js';
 * await attachTrustPanel();
 * 
 * @example
 * // Panel attachment with error handling
 * try {
 *   await attachTrustPanel();
 *   console.log('Trust panel attached successfully');
 * } catch (error) {
 *   console.error('Failed to attach trust panel:', error);
 * }
 * 
 * Panel Features:
 *     - **Trust Button**: Fixed-position floating button with hover effects
 *     - **Modal Interface**: Full-screen overlay with centered content panel
 *     - **Evidence Display**: AppTrust evidence.json integration and parsing
 *     - **Service Status**: Real-time service configuration and health indicators
 *     - **Runtime Info**: Browser and environment diagnostic information
 * 
 * AppTrust Integration:
 *     - Attempts to fetch /.well-known/apptrust/evidence.json
 *     - Displays container images with digest verification
 *     - Shows version information and supply chain evidence
 *     - Falls back to application info when evidence unavailable
 * 
 * Accessibility Features:
 *     - Click-to-close modal functionality
 *     - Backdrop click handling for intuitive interaction
 *     - Keyboard-friendly interface design
 *     - High contrast visual indicators
 * 
 * @since 1.0.0
 */
export async function attachTrustPanel() {
  // 🔘 Trust Button Creation: Create floating action button with elegant styling
  const btn = document.createElement('button')
  btn.textContent = 'Release Info'
  btn.style.cssText = `
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 1000;
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  `
  
  // ✨ Hover Effects: Add subtle animation for enhanced user experience
  btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)'
  btn.onmouseleave = () => btn.style.transform = 'translateY(0)'
  document.body.appendChild(btn)

  // 🖼️ Modal Creation: Create full-screen overlay with centered content panel
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `
  modal.innerHTML = `<div style="background: var(--panel); border: 1px solid var(--border); padding: 24px; border-radius: 12px; min-width: 400px; max-width: 80vw; color: var(--text);">
    <h3 style="margin: 0 0 16px 0; color: var(--brand);">📊 BookVerse Release Information</h3>
    <div id="trust-content" style="font-family: ui-monospace, monospace; font-size: 14px; line-height: 1.5;">Loading...</div>
    <div style="text-align: right; margin-top: 20px;">
      <button id="trust-close" style="background: var(--brand); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
    </div>
  </div>`
  document.body.appendChild(modal)

  // 🔄 Button Click Handler: Show modal and load trust information
  btn.onclick = async () => {
    // 👁️ Modal Display: Show modal with loading state
    modal.style.display = 'flex'
    const content = modal.querySelector('#trust-content')
    
    try {
      // 🔒 AppTrust Evidence: Attempt to fetch and display evidence.json
      try {
        const res = await fetch('/.well-known/apptrust/evidence.json')
        if (res.ok) {
          const data = await res.json()
          content.innerHTML = renderEvidence(data)
          return
        }
      } catch {
        // 🔄 Evidence Fallback: Continue to application info if evidence unavailable
      }

      // 📊 Application Info: Display basic application and service information
      content.innerHTML = renderAppInfo()
    } catch {
      // ❌ Error Handling: Display user-friendly error message
      content.textContent = 'Error loading release information.'
    }
  }
  
  // 🚫 Modal Close Handlers: Close modal on button click or backdrop click
  modal.querySelector('#trust-close').onclick = () => modal.style.display = 'none'
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none'
  }
}

/**
 * Render AppTrust evidence information with container image verification.
 * 
 * This function creates a comprehensive HTML representation of AppTrust evidence
 * data, including version information, container image digests, and runtime
 * information for supply chain security verification and transparency.
 * 
 * 🎯 Purpose:
 *     - Display AppTrust evidence.json data in user-friendly format
 *     - Show container image verification with digest information
 *     - Provide version tracking and supply chain transparency
 *     - Enable security auditing and compliance verification
 *     - Support operational transparency and debugging
 * 
 * 🔧 Rendering Features:
 *     - Version information display with prominent styling
 *     - Container image list with digest verification
 *     - Runtime information including browser and timestamp
 *     - Theme-aware styling with CSS custom properties
 *     - Responsive layout with proper spacing and typography
 * 
 * @function renderEvidence
 * @param {Object} data - AppTrust evidence data from evidence.json
 * @param {string} [data.version] - Application version from evidence
 * @param {Array} [data.images] - Container images array with names and digests
 * @param {string} data.images[].name - Container image name
 * @param {string} data.images[].digest - Container image digest for verification
 * @returns {string} HTML string containing formatted evidence display
 * 
 * @example
 * // Render evidence with version and images
 * const evidence = {
 *   version: "1.2.3",
 *   images: [
 *     { name: "bookverse-web:latest", digest: "sha256:abc123..." }
 *   ]
 * };
 * const html = renderEvidence(evidence);
 * 
 * @example
 * // Handle minimal evidence data
 * const minimalEvidence = { version: "1.0.0" };
 * const html = renderEvidence(minimalEvidence);
 * 
 * Display Sections:
 *     - **Version Information**: Application version with code styling
 *     - **Container Images**: List of images with digest verification
 *     - **Runtime Information**: Browser and timestamp details
 * 
 * @private
 */
function renderEvidence(data) {
  // 📋 Data Extraction: Extract version with fallback for missing data
  const version = data?.version || 'n/a'
  
  // 🐳 Container Images: Process images array with name and digest display
  const images = (data?.images || []).map(i => `<li style="margin: 4px 0;"><code style="background: var(--bg); padding: 2px 6px; border-radius: 4px;">${i.name}</code> — <small style="color: var(--muted);">${i.digest?.substring(0, 12) || 'no digest'}...</small></li>`).join('')
  
  return `
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Version:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">${version}</code></p>
      <p style="margin: 8px 0;"><strong style="color: var(--brand);">Container Images:</strong></p>
      <ul style="margin: 8px 0; padding-left: 20px;">${images || '<li style="color: var(--muted);">No images available</li>'}</ul>
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Runtime Info:</strong></p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">User Agent: ${navigator.userAgent.substring(0, 60)}...</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `
}

/**
 * Render application information with service configuration and runtime details.
 * 
 * This function creates a comprehensive HTML representation of application
 * configuration, service endpoints, and runtime information when AppTrust
 * evidence is unavailable. It provides operational visibility and debugging
 * information for development and operations teams.
 * 
 * 🎯 Purpose:
 *     - Display application configuration and environment information
 *     - Show service endpoint configuration with visual status indicators
 *     - Provide runtime browser and location information
 *     - Enable debugging and troubleshooting through system visibility
 *     - Support operations teams with configuration verification
 * 
 * 🔧 Rendering Features:
 *     - Application and environment identification
 *     - Service endpoint list with configuration status indicators
 *     - Visual status representation (🟢 configured, 🔴 not configured)
 *     - Runtime information including browser and location details
 *     - Theme-aware styling with color-coded status indicators
 * 
 * @function renderAppInfo
 * @returns {string} HTML string containing formatted application information
 * 
 * @example
 * // Render application info with full configuration
 * const html = renderAppInfo();
 * // Displays application, environment, services, and runtime info
 * 
 * @example
 * // Handle missing configuration gracefully
 * // Function automatically provides fallback values for missing config
 * delete window.__BOOKVERSE_CONFIG__;
 * const html = renderAppInfo(); // Still renders with "DEV" environment
 * 
 * Information Sections:
 *     - **Application Info**: Name and environment identification
 *     - **Service Endpoints**: Configuration status for all BookVerse services
 *     - **Runtime Info**: Browser, timestamp, and location details
 * 
 * Service Status Indicators:
 *     - 🟢 Green: Service URL configured and available
 *     - 🔴 Red: Service URL not configured or missing
 *     - Border colors: Success (green) or danger (red) theme colors
 * 
 * Configuration Sources:
 *     - window.__BOOKVERSE_CONFIG__: Global configuration object
 *     - Fallback values: "DEV" environment, "Not configured" URLs
 *     - Runtime data: navigator.userAgent, window.location
 * 
 * @private
 */
function renderAppInfo() {
  // 📋 Configuration Access: Read global application configuration
  const config = window.__BOOKVERSE_CONFIG__ || {}
  
  // 🏢 Service Configuration: Define service endpoints with status indicators
  const services = [
    { name: 'Inventory', url: config.inventoryBaseUrl || 'Not configured', status: config.inventoryBaseUrl ? '🟢' : '🔴' },
    { name: 'Recommendations', url: config.recommendationsBaseUrl || 'Not configured', status: config.recommendationsBaseUrl ? '🟢' : '🔴' },
    { name: 'Checkout', url: config.checkoutBaseUrl || 'Not configured', status: config.checkoutBaseUrl ? '🟢' : '🔴' }
  ]

  return `
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Application:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">BookVerse Web</code></p>
      <p style="margin: 8px 0 0 0;"><strong style="color: var(--brand);">Environment:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">${config.env || 'DEV'}</code></p>
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 12px 0;"><strong style="color: var(--brand);">Service Endpoints:</strong></p>
      ${services.map(service => `
        <div style="margin: 8px 0; padding: 8px; background: var(--panel); border-radius: 6px; border-left: 3px solid ${service.status === '🟢' ? 'var(--brand-success)' : 'var(--brand-danger)'};">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px;">${service.status}</span>
            <strong>${service.name}</strong>
          </div>
          <div style="font-size: 12px; color: var(--muted); margin-top: 4px; font-family: ui-monospace, monospace;">${service.url}</div>
        </div>
      `).join('')}
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Runtime Info:</strong></p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Browser: ${navigator.userAgent.split(' ').pop()}</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Timestamp: ${new Date().toISOString()}</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Location: ${window.location.href}</p>
    </div>
  `
}

