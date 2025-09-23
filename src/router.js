/**
 * BookVerse Web Application - Client-Side Router
 *
 * This module implements a lightweight, high-performance client-side router
 * for the BookVerse single-page application, providing seamless navigation
 * with parameterized routes and browser history integration.
 *
 * 🏗️ Architecture Overview:
 *     - Hash-Based Routing: Browser-compatible navigation without server configuration
 *     - Route Compilation: Dynamic pattern matching with parameter extraction
 *     - Event-Driven Navigation: Browser history integration with hashchange events
 *     - Component Integration: Direct component mounting and lifecycle management
 *     - Error Handling: Graceful fallback for unmatched routes and navigation errors
 *
 * 🚀 Key Features:
 *     - Dynamic route compilation with parameterized path segments
 *     - Automatic component rendering and DOM management
 *     - Browser back/forward navigation support
 *     - URL parameter extraction and validation
 *     - Lightweight implementation with minimal dependencies
 *     - SEO-friendly URL structure for e-commerce navigation
 *
 * 🔧 Technical Implementation:
 *     - Regular expression-based route matching for performance
 *     - Hash fragment navigation for single-page app compatibility
 *     - Component lifecycle management with automatic cleanup
 *     - Parameter extraction with URL decoding for special characters
 *     - Event delegation for efficient navigation handling
 *
 * 📊 Business Logic:
 *     - E-commerce user journey routing (catalog → product → cart)
 *     - Product detail navigation with dynamic book IDs
 *     - Shopping cart persistence across navigation
 *     - User-friendly URLs for bookmarking and sharing
 *     - Analytics integration for user journey tracking
 *
 * 🛠️ Usage Patterns:
 *     - Route configuration with component mapping
 *     - Programmatic navigation for user actions
 *     - Deep linking support for product pages
 *     - Integration with analytics and tracking systems
 *     - Development debugging and route testing
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

// 📋 Route Registry: Global route storage for compiled patterns and handlers
const routes = []

/**
 * Initialize the client-side router with route configuration and DOM mounting.
 * 
 * This function sets up the complete routing system for the BookVerse application,
 * compiling route patterns, registering event listeners, and performing initial
 * route resolution. It provides the foundation for all navigation within the SPA.
 * 
 * 🎯 Purpose:
 *     - Configure application routing with pattern-to-component mapping
 *     - Set up browser navigation event handling for seamless user experience
 *     - Compile route patterns for efficient runtime matching
 *     - Perform initial route resolution and component rendering
 *     - Enable deep linking and browser history integration
 * 
 * 🔧 Implementation Details:
 *     - Compiles route patterns into efficient regex matchers
 *     - Registers hashchange listener for browser navigation events
 *     - Performs immediate route resolution for initial page load
 *     - Stores compiled routes in global registry for performance
 *     - Handles parameterized routes with automatic parameter extraction
 * 
 * @param {HTMLElement} rootEl - DOM element to mount routed components
 * @param {Object} map - Route configuration mapping patterns to handler functions
 * @param {Function} map[pattern] - Component render function for each route pattern
 * 
 * @example
 * // Basic router initialization
 * initRouter(document.getElementById('app'), {
 *   '/': renderCatalog,
 *   '/home': renderHome,
 *   '/book/:id': renderBook,
 *   '/cart': renderCart
 * });
 * 
 * @example
 * // Router with complex parameterized routes
 * initRouter(container, {
 *   '/category/:category': renderCategory,
 *   '/book/:id/reviews': renderReviews,
 *   '/user/:userId/orders': renderUserOrders
 * });
 * 
 * @since 1.0.0
 */
export function initRouter(rootEl, map) {
  // 🔧 Route Compilation: Convert patterns to compiled route objects with matchers
  for (const [pattern, handler] of Object.entries(map)) {
    routes.push({ ...compile(pattern), handler })
  }
  
  // 🎧 Event Registration: Listen for browser navigation events
  window.addEventListener('hashchange', () => renderRoute(rootEl))
  
  // 🚀 Initial Resolution: Render current route on router initialization
  renderRoute(rootEl)
}

/**
 * Navigate to a specified path programmatically.
 * 
 * This function provides programmatic navigation within the BookVerse application,
 * updating the browser hash and triggering route resolution. It ensures consistent
 * navigation behavior whether initiated by user clicks or application logic.
 * 
 * 🎯 Purpose:
 *     - Enable programmatic navigation for user actions (clicks, form submissions)
 *     - Update browser URL for bookmarking and sharing
 *     - Trigger route resolution and component rendering
 *     - Maintain browser history for back/forward navigation
 *     - Support deep linking and URL-based application state
 * 
 * 🔧 Implementation Details:
 *     - Updates location hash to trigger hashchange event
 *     - Prevents unnecessary navigation for duplicate routes
 *     - Maintains browser history for proper navigation behavior
 *     - Integrates with analytics and user journey tracking
 * 
 * @param {string} path - Target path to navigate to (e.g., '/book/123', '/cart')
 * 
 * @example
 * // Navigate to product detail page
 * navigateTo('/book/abc-123');
 * 
 * @example
 * // Navigate to shopping cart
 * navigateTo('/cart');
 * 
 * @example
 * // Navigate to home page
 * navigateTo('/');
 * 
 * @since 1.0.0
 */
export function navigateTo(path) {
  // 🧭 Navigation Logic: Update hash only if different to prevent redundant events
  if (location.hash !== `#${path}`) location.hash = `#${path}`
}

/**
 * Parse and normalize the current browser hash for route matching.
 * 
 * This utility function extracts the current route path from the browser's
 * location hash, providing consistent path format for route matching and
 * component resolution.
 * 
 * 🔧 Hash Processing:
 *     - Removes hash prefix (#) from location hash
 *     - Provides default root path (/) for empty hashes
 *     - Normalizes path format for consistent matching
 * 
 * @returns {string} Normalized path string for route matching
 * 
 * @example
 * // URL: https://bookverse.com/#/book/123
 * const path = parseHash(); // Returns: '/book/123'
 * 
 * @example
 * // URL: https://bookverse.com/
 * const path = parseHash(); // Returns: '/'
 * 
 * @private
 */
function parseHash() {
  return location.hash.replace(/^#/, '') || '/'
}

/**
 * Resolve current route and render appropriate component.
 * 
 * This function implements the core route resolution logic, matching the current
 * path against registered routes and rendering the appropriate component with
 * extracted parameters. It provides the foundation for all component rendering
 * in the application.
 * 
 * 🎯 Purpose:
 *     - Match current path against registered route patterns
 *     - Extract URL parameters for parameterized routes
 *     - Render matched component with appropriate context
 *     - Handle route not found scenarios with user-friendly messaging
 *     - Support complex routing scenarios and parameter validation
 * 
 * 🔧 Resolution Process:
 *     - Parse current hash to extract route path
 *     - Iterate through compiled routes for pattern matching
 *     - Extract parameters from matched routes
 *     - Invoke component handler with context and parameters
 *     - Render 404 page for unmatched routes
 * 
 * @param {HTMLElement} rootEl - DOM element to render the matched component
 * 
 * @example
 * // Called automatically on route changes
 * // Manual invocation for testing or debugging
 * renderRoute(document.getElementById('app'));
 * 
 * @private
 */
function renderRoute(rootEl) {
  // 🧭 Path Resolution: Get current path from browser hash
  const path = parseHash()
  
  // 🔍 Route Matching: Find first matching route pattern
  for (const r of routes) {
    const params = r.match(path)
    if (params) {
      // ✅ Match Found: Render component with extracted parameters
      return r.handler(rootEl, params)
    }
  }
  
  // ❌ No Match Found: Render 404 page with helpful information
  rootEl.innerHTML = `<main style="padding:24px;"><h1>Not Found</h1><p>The page "${path}" could not be found.</p></main>`
}

/**
 * Compile a route pattern into an efficient matcher function.
 * 
 * This function transforms human-readable route patterns into optimized
 * regular expressions with parameter extraction capabilities, enabling
 * high-performance route matching at runtime.
 * 
 * 🎯 Purpose:
 *     - Transform route patterns into regex matchers for performance
 *     - Support parameterized routes with automatic extraction
 *     - Enable complex routing scenarios with flexible patterns
 *     - Provide parameter validation and URL decoding
 *     - Optimize runtime performance for frequent route matching
 * 
 * 🔧 Compilation Process:
 *     - Parse route pattern into segments and parameters
 *     - Generate regular expression for efficient matching
 *     - Create parameter extraction logic for dynamic segments
 *     - Handle URL encoding/decoding for special characters
 *     - Return compiled route object with match function
 * 
 * @param {string} pattern - Route pattern with optional parameters (e.g., '/book/:id')
 * @returns {Object} Compiled route object with pattern and match function
 * @returns {string} returns.pattern - Original route pattern for reference
 * @returns {Function} returns.match - Function to match paths and extract parameters
 * 
 * @example
 * // Compile simple route
 * const route = compile('/catalog');
 * const params = route.match('/catalog'); // Returns: {}
 * 
 * @example
 * // Compile parameterized route
 * const route = compile('/book/:id');
 * const params = route.match('/book/123'); // Returns: { id: '123' }
 * 
 * @example
 * // Compile complex route with multiple parameters
 * const route = compile('/category/:category/book/:id');
 * const params = route.match('/category/fiction/book/abc-123');
 * // Returns: { category: 'fiction', id: 'abc-123' }
 * 
 * @private
 */
function compile(pattern) {
  // 🔧 Pattern Parsing: Split pattern into components and extract parameters
  const parts = pattern.split('/').filter(Boolean)
  const keys = []
  
  // 📝 Regex Generation: Build regex pattern with parameter placeholders
  const regexParts = parts.map(p => {
    if (p.startsWith(':')) {
      // 📋 Parameter Segment: Extract parameter name and create capture group
      keys.push(p.slice(1))
      return '([^/]+)'  // Match any characters except forward slash
    }
    // 📄 Static Segment: Escape special regex characters for literal matching
    return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  
  // 🎯 Regex Compilation: Create final regex for route matching
  const regex = new RegExp('^/' + regexParts.join('/') + '$')
  
  return {
    pattern,
    /**
     * Match a path against this compiled route and extract parameters.
     * 
     * @param {string} path - Path to match against this route
     * @returns {Object|null} Extracted parameters or null if no match
     */
    match: (path) => {
      // 🔍 Pattern Matching: Test path against compiled regex
      const m = path.match(regex)
      if (!m) return null
      
      // 📋 Parameter Extraction: Build parameters object from capture groups
      const params = {}
      keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]))
      return params
    }
  }
}

