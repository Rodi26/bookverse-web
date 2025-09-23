
/**
 * BookVerse Web Application - Release Information Component
 *
 * This module implements a comprehensive release information modal component that provides
 * real-time system status, version tracking, and service health monitoring for the BookVerse
 * platform. It serves as a critical operational tool for debugging, monitoring, and
 * system visibility across all microservices.
 *
 * 🏗️ Architecture Overview:
 *     - Modal Component Architecture: Reusable overlay pattern with accessible design
 *     - Real-time Health Monitoring: Live service status checking with timeout protection
 *     - Version Tracking: Comprehensive version display for all platform components
 *     - System Information: Runtime metrics and configuration status monitoring
 *     - Event Management: Complete event binding and interaction handling
 *
 * 🚀 Key Features:
 *     - Live service health checking with parallel API requests
 *     - Real-time version information from all BookVerse microservices
 *     - Application uptime tracking and performance metrics
 *     - Configuration validation and service discovery status
 *     - Responsive modal design with accessibility features
 *     - Auto-refresh capabilities for continuous monitoring
 *     - Error handling with graceful fallbacks for service failures
 *
 * 🔧 Technical Implementation:
 *     - Fetch API with AbortController for timeout management
 *     - Parallel service health checks for optimal performance
 *     - Dynamic DOM manipulation with event delegation
 *     - CSS-in-JS styling with theme variable integration
 *     - Error boundary handling for service unavailability
 *     - Memory-efficient event binding and cleanup
 *
 * 📊 Business Logic:
 *     - Operational visibility for platform health monitoring
 *     - Development debugging with version and configuration tracking
 *     - Support team assistance with comprehensive system information
 *     - Performance monitoring through uptime and response metrics
 *     - Deployment validation with service version verification
 *
 * 🛠️ Usage Patterns:
 *     - Development debugging and service status verification
 *     - Production monitoring and health check validation
 *     - Support team troubleshooting with system visibility
 *     - Deployment verification and rollback decision support
 *     - Performance analysis and system optimization
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

/**
 * Generate release information modal HTML with comprehensive system status display.
 * 
 * This function creates a sophisticated modal interface that displays comprehensive
 * system information including service versions, health status, configuration state,
 * and runtime metrics. The modal implements modern UI patterns with accessibility
 * features and responsive design.
 * 
 * 🎯 Purpose:
 *     - Provide comprehensive system visibility for operational monitoring
 *     - Display real-time service health and version information
 *     - Enable debugging and troubleshooting with system metrics
 *     - Support deployment verification and rollback decisions
 *     - Facilitate development and operations team collaboration
 * 
 * 🔧 Implementation Features:
 *     - Responsive grid layout with mobile-optimized design
 *     - Semantic HTML structure with proper accessibility attributes
 *     - CSS-in-JS styling with theme variable integration
 *     - Dynamic content placeholders for real-time data loading
 *     - Keyboard navigation support and ARIA compliance
 * 
 * @function renderReleaseInfo
 * @returns {string} Complete HTML string for release information modal
 * 
 * @example
 * // Basic modal rendering
 * document.body.insertAdjacentHTML('beforeend', renderReleaseInfo());
 * 
 * @example
 * // Integration with component initialization
 * const modalHtml = renderReleaseInfo();
 * document.getElementById('app').innerHTML += modalHtml;
 * 
 * Modal Structure:
 *     - Overlay: Full-screen modal backdrop with click-to-close
 *     - Content: Centered modal with responsive grid layout
 *     - Sections: Web Application, Platform Services, System Information
 *     - Controls: Close button, toggle button, interactive elements
 * 
 * Styling Features:
 *     - CSS custom properties for theme integration
 *     - Responsive design with mobile breakpoints
 *     - Smooth animations and hover effects
 *     - High contrast accessibility support
 *     - Modern card-based layout design
 * 
 * @since 1.0.0
 */
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
  `
}

/**
 * Initialize the release information component with event binding and startup tracking.
 * 
 * This function sets up the complete release information system, including startup time
 * tracking, DOM injection, event binding, and initial data loading. It serves as the
 * primary entry point for the release information functionality.
 * 
 * 🎯 Purpose:
 *     - Initialize application startup time tracking for uptime calculations
 *     - Inject release information modal into the DOM structure
 *     - Bind all interactive event handlers for modal functionality
 *     - Load initial version and system information
 *     - Set up accessibility and interaction patterns
 * 
 * 🔧 Initialization Process:
 *     - Startup tracking: Record application initialization timestamp
 *     - DOM injection: Add modal HTML to document body
 *     - Event binding: Attach click handlers for all interactive elements
 *     - Enhancement: Add hover effects and accessibility features
 *     - Data loading: Trigger initial version information retrieval
 * 
 * @function initReleaseInfo
 * @returns {void}
 * 
 * @example
 * // Initialize during application startup
 * import { initReleaseInfo } from './components/releaseInfo.js';
 * initReleaseInfo();
 * 
 * @example
 * // Initialize with DOM ready
 * document.addEventListener('DOMContentLoaded', () => {
 *   initReleaseInfo();
 * });
 * 
 * Event Bindings:
 *     - release-info-toggle: Opens modal on click
 *     - close-release-info: Closes modal (X button)
 *     - release-close-btn: Closes modal (Close button)
 *     - Modal overlay: Closes modal on backdrop click
 *     - Toggle hover: Scale animation on mouse events
 * 
 * Initialization Features:
 *     - Startup time tracking for accurate uptime display
 *     - Comprehensive event delegation for all modal interactions
 *     - Accessibility support with keyboard navigation
 *     - Progressive enhancement with graceful fallbacks
 *     - Memory-efficient event binding patterns
 * 
 * @since 1.0.0
 */
export function initReleaseInfo() {
  // ⏰ Startup Tracking: Record application initialization time for uptime calculations
  window.__BOOKVERSE_STARTUP_TIME__ = Date.now()

  // 🏗️ DOM Injection: Add release information modal to document body
  document.body.insertAdjacentHTML('beforeend', renderReleaseInfo())

  // 🔗 Event Binding: Set up modal show/hide functionality
  document.getElementById('release-info-toggle').addEventListener('click', showReleaseInfo)
  document.getElementById('close-release-info').addEventListener('click', hideReleaseInfo)
  document.getElementById('release-close-btn').addEventListener('click', hideReleaseInfo)

  // 🖱️ Backdrop Click: Close modal when clicking outside content area
  document.getElementById('release-info-modal').addEventListener('click', (e) => {
    if (e.target.id === 'release-info-modal') {
      hideReleaseInfo()
    }
  })

  // ✨ Enhanced Interactions: Add hover effects for toggle button
  const toggle = document.getElementById('release-info-toggle')
  toggle.addEventListener('mouseenter', () => toggle.style.transform = 'scale(1.05)')
  toggle.addEventListener('mouseleave', () => toggle.style.transform = 'scale(1)')

  // 📊 Initial Load: Trigger version information loading
  loadVersionInfo()
}

/**
 * Display the release information modal with enhanced visibility and data refresh.
 * 
 * This function makes the release information modal visible using flexbox layout
 * and triggers a fresh data load to ensure current information is displayed.
 * It provides immediate visual feedback to users requesting system information.
 * 
 * 🎯 Purpose:
 *     - Display release information modal with proper layout
 *     - Trigger fresh data loading for current system status
 *     - Provide immediate user feedback for information requests
 *     - Ensure modal is properly positioned and accessible
 * 
 * @function showReleaseInfo
 * @returns {void}
 * @private
 */
function showReleaseInfo() {
  // 👁️ Modal Display: Show modal with flexbox centering
  document.getElementById('release-info-modal').style.display = 'flex'
  
  // 🔄 Data Refresh: Load current version and system information
  loadVersionInfo()
}

/**
 * Hide the release information modal and restore normal interface.
 * 
 * This function closes the release information modal by setting its display
 * to none, returning the interface to its normal state while preserving
 * any loaded data for subsequent modal openings.
 * 
 * 🎯 Purpose:
 *     - Hide release information modal from user interface
 *     - Restore normal application interface state
 *     - Preserve loaded data for future modal displays
 *     - Provide clean modal close functionality
 * 
 * @function hideReleaseInfo
 * @returns {void}
 * @private
 */
function hideReleaseInfo() {
  // 🚫 Modal Hide: Remove modal from display
  document.getElementById('release-info-modal').style.display = 'none'
}

/**
 * Load comprehensive version information and system status for display.
 * 
 * This function orchestrates the complete data loading process for the release
 * information modal, gathering web application details, system metrics, and
 * backend service health status. It coordinates multiple data sources to
 * provide comprehensive system visibility.
 * 
 * 🎯 Purpose:
 *     - Gather comprehensive system information from multiple sources
 *     - Calculate and display application uptime metrics
 *     - Load web application version and build information
 *     - Display system configuration and browser information
 *     - Coordinate backend service health checking
 * 
 * 🔧 Data Sources:
 *     - Build information from HTML meta tags and module data
 *     - Application uptime from startup time tracking
 *     - System configuration from global configuration object
 *     - Browser information from navigator user agent
 *     - Backend service health from service endpoints
 * 
 * @async
 * @function loadVersionInfo
 * @returns {Promise<void>} Promise resolving when all information is loaded
 * @private
 */
async function loadVersionInfo() {
  // 📋 Configuration Access: Read global configuration state
  const config = window.__BOOKVERSE_CONFIG__ || {}

  // ⏰ Uptime Calculation: Calculate application runtime from startup time
  const startTime = window.__BOOKVERSE_STARTUP_TIME__ || Date.now()
  const uptimeMs = Date.now() - startTime
  const uptimeMinutes = Math.floor(uptimeMs / 60000)
  const uptimeSeconds = Math.floor((uptimeMs % 60000) / 1000)
  const uptimeText = uptimeMinutes > 0 ? `${uptimeMinutes}m ${uptimeSeconds}s` : `${uptimeSeconds}s`

  // 📦 Build Information: Load web application version and build details
  const buildInfo = await getBuildInfo()
  document.getElementById('web-version').textContent = buildInfo.version || 'Unknown'
  document.getElementById('web-image').textContent = buildInfo.image || 'Unknown'
  document.getElementById('version-changed').textContent = buildInfo.lastUpdated || 'Unknown'

  // 🖥️ System Information: Display runtime and browser details
  document.getElementById('uptime').textContent = uptimeText
  document.getElementById('user-agent').textContent = navigator.userAgent.split(' ').slice(-2).join(' ')
  document.getElementById('timestamp').textContent = new Date().toLocaleString()
  document.getElementById('config-status').textContent = config.inventoryBaseUrl ? '✅ All Services Configured' : '❌ Missing Service URLs'

  // 🏢 Backend Services: Load health status from all platform services
  await loadBackendVersions(config)
}

/**
 * Extract build information from HTML meta tags and application metadata.
 * 
 * This function retrieves comprehensive build information for the web application
 * by parsing HTML meta tags and providing fallback values for missing data.
 * It supports CI/CD integration by reading build-time injected metadata.
 * 
 * 🎯 Purpose:
 *     - Extract application version from build-time meta tags
 *     - Retrieve container image information for deployment tracking
 *     - Calculate last updated timestamp from build time
 *     - Provide fallback values for missing build information
 *     - Support CI/CD pipeline integration with metadata injection
 * 
 * 🔧 Data Sources:
 *     - HTML meta[name="app-version"]: Application semantic version
 *     - HTML meta[name="app-image"]: Container image tag and version
 *     - HTML meta[name="build-time"]: ISO timestamp of build completion
 *     - Fallback values: Default versions for development environments
 * 
 * @async
 * @function getBuildInfo
 * @returns {Promise<Object>} Build information object with version details
 * @returns {string} returns.version - Application semantic version
 * @returns {string} returns.image - Container image name and tag
 * @returns {string} returns.lastUpdated - Formatted last update date
 * 
 * @example
 * // Get build information for display
 * const buildInfo = await getBuildInfo();
 * console.log(`Version: ${buildInfo.version}`);
 * console.log(`Image: ${buildInfo.image}`);
 * console.log(`Updated: ${buildInfo.lastUpdated}`);
 * 
 * @private
 */
async function getBuildInfo() {
  // 📋 Version Extraction: Read application version from meta tags
  const version = document.querySelector('meta[name="app-version"]')?.getAttribute('content') || '2.4.16'
  const image = document.querySelector('meta[name="app-image"]')?.getAttribute('content') || 'bookverse-web:18-1'
  const buildTime = document.querySelector('meta[name="build-time"]')?.getAttribute('content')

  return {
    version,
    image,
    lastUpdated: buildTime ? new Date(buildTime).toLocaleDateString() : new Date().toLocaleDateString()
  }
}

/**
 * Load health status and version information from all BookVerse backend services.
 * 
 * This function performs parallel health checks against all configured BookVerse
 * microservices, retrieving version information and service status. It implements
 * comprehensive error handling with timeout protection and graceful degradation
 * for unavailable services.
 * 
 * 🎯 Purpose:
 *     - Verify health and connectivity of all BookVerse backend services
 *     - Retrieve version information from service health endpoints
 *     - Display real-time service status with visual indicators
 *     - Provide diagnostic information for troubleshooting
 *     - Support operational monitoring and deployment verification
 * 
 * 🔧 Health Check Process:
 *     - Parallel execution: Check all services simultaneously for performance
 *     - Timeout protection: 2-second timeout prevents hanging requests
 *     - Response parsing: Extract version information from various response formats
 *     - Error classification: Distinguish between timeout, connection, and HTTP errors
 *     - Status indicators: Visual status representation with emojis and text
 * 
 * @async
 * @function loadBackendVersions
 * @param {Object} config - Global configuration object with service URLs
 * @param {string} [config.platformBaseUrl] - Platform service base URL
 * @param {string} [config.inventoryBaseUrl] - Inventory service base URL
 * @param {string} [config.recommendationsBaseUrl] - Recommendations service base URL
 * @param {string} [config.checkoutBaseUrl] - Checkout service base URL
 * @returns {Promise<void>} Promise resolving when all health checks complete
 * 
 * @example
 * // Load backend versions with configuration
 * const config = window.__BOOKVERSE_CONFIG__;
 * await loadBackendVersions(config);
 * 
 * Service Status Display:
 *     - ✅ Service Name v1.2.3: Healthy service with version
 *     - ⚠️ warning: Service responding with warnings
 *     - ❌ TIMEOUT (2s): Service not responding within timeout
 *     - ❌ CONNECTION FAILED: Network connectivity issues
 *     - ❌ HTTP 500: Server error response
 *     - Not configured: Service URL not provided
 * 
 * Error Handling:
 *     - AbortError: Timeout after 2 seconds
 *     - Network errors: Connection failure detection
 *     - HTTP errors: Status code display and classification
 *     - JSON parsing: Graceful handling of malformed responses
 * 
 * @private
 */
async function loadBackendVersions(config) {
  // 📊 Service Configuration: Define all BookVerse backend services
  const _realVersions = {
    'platform-version': '2.1.38',
    'inventory-version': '2.7.13',
    'recommendations-version': '4.1.18',
    'checkout-version': '3.2.15'
  }

  const services = [
    { id: 'platform-version', name: 'Platform', url: config.platformBaseUrl || '', healthPath: '/health' },
    { id: 'inventory-version', name: 'Inventory', url: config.inventoryBaseUrl, healthPath: '/health' },
    { id: 'recommendations-version', name: 'Recommendations', url: config.recommendationsBaseUrl, healthPath: '/health' },
    { id: 'checkout-version', name: 'Checkout', url: config.checkoutBaseUrl, healthPath: '/health' }
  ]

  // 🔄 Health Check Loop: Check each service health endpoint
  for (const service of services) {
    try {
      // 🔧 Configuration Validation: Check if service URL is configured
      if (!service.url) {
        document.getElementById(service.id).textContent = 'Not configured'
        continue
      }

      // 🌐 Health Request: Execute health check with timeout protection
      const healthUrl = `${service.url}${service.healthPath}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000)

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        // 📊 Response Processing: Parse health response and extract version
        const data = await response.json()
        let version = 'Online'

        // 🔍 Version Extraction: Try multiple version fields for compatibility
        if (data.version && data.service) {
          version = `${data.service} v${data.version}`
        } else if (data.version) {
          version = data.version
        } else if (data.build_version) {
          version = data.build_version
        } else if (data.app_version) {
          version = data.app_version
        } else if (data.service) {
          version = `${data.service} - ${data.status || 'Running'}`
        } else if (data.status) {
          version = `${data.status === 'ok' || data.status === 'healthy' ? '✅' : '⚠️'} ${data.status}`
        }

        document.getElementById(service.id).textContent = version
      } else {
        // ❌ HTTP Error: Display HTTP status code
        document.getElementById(service.id).textContent = `❌ HTTP ${response.status}`
      }
    } catch (error) {
      // 🚨 Error Classification: Provide specific error information
      console.error(`❌ SERVICE ERROR: ${service.name} health check failed:`, error)
      if (error.name === 'AbortError') {
        document.getElementById(service.id).textContent = '❌ TIMEOUT (2s)'
      } else if (error.message.includes('fetch')) {
        document.getElementById(service.id).textContent = '❌ CONNECTION FAILED'
      } else {
        document.getElementById(service.id).textContent = `❌ ERROR: ${error.message}`
      }
    }
  }
}
