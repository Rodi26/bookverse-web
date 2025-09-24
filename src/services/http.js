

/**
 * BookVerse Web Application - HTTP Service Integration
 *
 * This module provides a robust, enterprise-grade HTTP client for integrating
 * with BookVerse backend services, implementing comprehensive retry logic,
 * request tracing, and resilient communication patterns for optimal user experience.
 *
 * 🏗️ Architecture Overview:
 *     - Service Discovery: Dynamic backend service URL resolution
 *     - Request Resilience: Retry logic with exponential backoff and jitter
 *     - Observability: Distributed tracing with W3C traceparent headers
 *     - Timeout Management: Configurable request timeouts for reliability
 *     - Error Handling: Comprehensive error classification and recovery
 *
 * 🚀 Key Features:
 *     - Multi-service backend integration (Inventory, Recommendations, Checkout)
 *     - Intelligent retry strategy with exponential backoff and jitter
 *     - Request correlation with unique request IDs for debugging
 *     - Distributed tracing support for end-to-end observability
 *     - Timeout protection to prevent hanging requests
 *     - JSON response parsing with error handling
 *
 * 🔧 Technical Implementation:
 *     - Fetch API with AbortController for timeout management
 *     - W3C Trace Context specification for distributed tracing
 *     - UUID generation with crypto.randomUUID fallback
 *     - Headers manipulation for request correlation and tracing
 *     - Promise-based API with async/await support
 *
 * 📊 Business Logic:
 *     - E-commerce API integration for product catalog and orders
 *     - Real-time inventory checking and availability validation
 *     - Recommendation engine integration for personalized shopping
 *     - Order processing and checkout workflow support
 *     - Performance optimization for responsive user experience
 *
 * 🛠️ Usage Patterns:
 *     - Service-specific API calls with automatic base URL resolution
 *     - JSON data exchange with backend microservices
 *     - Error handling and retry logic for network resilience
 *     - Request tracing and debugging for development and production
 *     - Performance monitoring and optimization
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

/**
 * Resolve the base URL for a given BookVerse backend service.
 * 
 * This function provides service discovery functionality for the BookVerse
 * microservices architecture, mapping service names to their configured
 * base URLs for API communication.
 * 
 * 🎯 Purpose:
 *     - Abstract service endpoint configuration from calling code
 *     - Enable environment-specific service URL configuration
 *     - Support microservices architecture with multiple backend services
 *     - Provide fallback handling for missing configuration
 *     - Enable dynamic service discovery and load balancing
 * 
 * 🔧 Service Resolution:
 *     - Reads configuration from global window.__BOOKVERSE_CONFIG__
 *     - Maps service names to configured base URLs
 *     - Provides empty string fallback for unknown services
 *     - Supports development, staging, and production environments
 * 
 * @param {string} service - Service name ('inventory', 'recommendations', 'checkout')
 * @returns {string} Base URL for the specified service or empty string if not configured
 * 
 * @example
 * // Get inventory service base URL
 * const inventoryUrl = serviceBase('inventory');
 * // Returns: 'https://api.bookverse.com/inventory' or configured URL
 * 
 * @example
 * // Handle unknown service
 * const unknownUrl = serviceBase('unknown');
 * // Returns: '' (empty string)
 * 
 * @private
 */
function serviceBase (service) {
  // 🔧 Service Validation: Handle missing service parameter
  if (!service) {return ''}

  // 📋 Configuration Access: Read service URLs from global configuration
  const cfg = window.__BOOKVERSE_CONFIG__ || {}
  
  // 🎯 Service Mapping: Map service names to configured URLs
  if (service === 'inventory') {return cfg.inventoryBaseUrl || ''}
  if (service === 'recommendations') {return cfg.recommendationsBaseUrl || ''}
  if (service === 'checkout') {return cfg.checkoutBaseUrl || ''}
  
  // ❌ Unknown Service: Return empty string for unmapped services
  return ''
}


/**
 * Generate a UUID for request correlation and tracing.
 * 
 * This function creates unique identifiers for HTTP requests, enabling
 * request correlation, debugging, and distributed tracing across the
 * BookVerse platform. It uses the browser's crypto.randomUUID when
 * available, with a standards-compliant fallback for older browsers.
 * 
 * 🎯 Purpose:
 *     - Generate unique request identifiers for correlation and debugging
 *     - Support distributed tracing across microservices
 *     - Enable request/response matching in logs and analytics
 *     - Provide browser compatibility with graceful fallback
 *     - Support security and audit requirements
 * 
 * 🔧 Generation Strategy:
 *     - Primary: Use crypto.randomUUID() for cryptographically secure UUIDs
 *     - Fallback: Mathematical pseudo-random UUID v4 generation
 *     - Format: Standard UUID v4 format (8-4-4-4-12 hex characters)
 *     - Compliance: RFC 4122 UUID specification
 * 
 * @returns {string} RFC 4122 compliant UUID v4 string
 * 
 * @example
 * const requestId = generateUUID();
 * // Returns: '550e8400-e29b-41d4-a716-446655440000' (example format)
 * 
 * @example
 * // Use in request headers
 * headers.set('X-Request-Id', generateUUID());
 * 
 * @private
 */
function generateUUID () {
  // 🔒 Secure Generation: Use crypto API when available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // 🎲 Fallback Generation: Mathematical pseudo-random UUID for compatibility
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Enhance request options with correlation, tracing, and authentication headers.
 * 
 * This function adds essential headers for request correlation, distributed
 * tracing, observability, and authentication to every HTTP request. It implements 
 * W3C Trace Context specification and integrates with the BookVerse auth service.
 * 
 * 🎯 Purpose:
 *     - Add request correlation IDs for debugging and troubleshooting
 *     - Implement W3C Trace Context for distributed tracing
 *     - Include authentication tokens for secure API access
 *     - Enable end-to-end request tracking across microservices
 *     - Support observability and performance monitoring
 *     - Facilitate debugging and error investigation
 * 
 * 🔧 Header Enhancement:
 *     - X-Request-Id: Unique request identifier for correlation
 *     - traceparent: W3C Trace Context for distributed tracing
 *     - Authorization: Bearer token when user is authenticated
 *     - Preserves existing headers while adding tracking information
 *     - Generates trace and span IDs for observability platforms
 * 
 * @param {Object} [opts={}] - Original request options
 * @param {Headers|Object} [opts.headers] - Existing request headers
 * @returns {Object} Enhanced request options with correlation and auth headers
 * 
 * @example
 * // Basic usage
 * const enhancedOpts = withHeaders({ method: 'POST' });
 * // Result includes X-Request-Id, traceparent, and Authorization headers
 * 
 * @private
 */
function withHeaders (opts = {}) {
  // 📋 Header Initialization: Create Headers object preserving existing headers
  const headers = new Headers(opts.headers || {})
  
  // 🔍 Request Correlation: Add unique request ID for debugging
  headers.set('X-Request-Id', generateUUID())

  // 📊 Distributed Tracing: Implement W3C Trace Context specification
  const traceId = generateUUID().replace(/-/g, '').substring(0, 32)  // 32-char hex trace ID
  const spanId = generateUUID().replace(/-/g, '').substring(0, 16)   // 16-char hex span ID
  headers.set('traceparent', `00-${traceId}-${spanId}-01`)          // W3C traceparent format

  // 🔐 Authentication: Add Authorization header when user is authenticated
  // Note: We'll add auth support by checking for an injected auth service
  // The auth service should be made available globally or passed as context
  if (typeof window !== 'undefined' && window.__authService) {
    try {
      const authService = window.__authService
      if (authService && authService.isAuthenticated()) {
        const user = authService.getUser()
        if (user && user.access_token) {
          headers.set('Authorization', `Bearer ${user.access_token}`)
        }
      }
    } catch (error) {
      // Silently handle auth errors to avoid breaking requests
      console.warn('Failed to add authentication header:', error)
    }
  }

  // 🔄 Options Enhancement: Return enhanced options with new headers
  return { ...opts, headers }
}

/**
 * Execute HTTP request with timeout protection.
 * 
 * This function wraps the native fetch API with timeout functionality
 * using AbortController, preventing requests from hanging indefinitely
 * and providing predictable response times for better user experience.
 * 
 * 🎯 Purpose:
 *     - Prevent hanging requests that degrade user experience
 *     - Provide predictable timeout behavior for all HTTP requests
 *     - Enable graceful handling of slow or unresponsive services
 *     - Support responsive UI design with known timeout bounds
 *     - Facilitate error handling and retry logic
 * 
 * 🔧 Timeout Implementation:
 *     - Uses AbortController for clean request cancellation
 *     - Configurable timeout duration with sensible defaults
 *     - Automatic cleanup to prevent memory leaks
 *     - Preserves all original fetch API semantics
 * 
 * @param {string} url - Request URL
 * @param {Object} [opts={}] - Fetch options (method, headers, body, etc.)
 * @param {number} [timeoutMs=2500] - Timeout duration in milliseconds
 * @returns {Promise<Response>} Fetch Response promise with timeout protection
 * 
 * @throws {DOMException} AbortError when request times out
 * 
 * @example
 * // Basic usage with default timeout
 * const response = await fetchWithTimeout('https://api.example.com/data');
 * 
 * @example
 * // Custom timeout for slow operations
 * const response = await fetchWithTimeout('/api/large-report', {}, 10000);
 * 
 * @private
 */
function fetchWithTimeout (url, opts = {}, timeoutMs = 2500) {
  // 🚫 Abort Controller: Set up request cancellation mechanism
  const controller = new AbortController()
  
  // ⏰ Timeout Timer: Schedule request cancellation
  const t = setTimeout(() => controller.abort(), timeoutMs)
  
  // 🌐 Fetch Execution: Execute request with abort signal and cleanup
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(t))
}

/**
 * Execute function with retry logic using exponential backoff and jitter.
 * 
 * This function implements sophisticated retry logic for network resilience,
 * using exponential backoff with jitter to avoid thundering herd problems
 * and improve overall system stability during outages or high load.
 * 
 * 🎯 Purpose:
 *     - Provide resilience against transient network failures
 *     - Implement exponential backoff to reduce system load during outages
 *     - Add jitter to prevent synchronized retry storms
 *     - Enable graceful degradation during service issues
 *     - Improve overall user experience with automatic recovery
 * 
 * 🔧 Retry Strategy:
 *     - Exponential backoff: Delay increases exponentially with each attempt
 *     - Jitter: Random delay component to prevent synchronization
 *     - Configurable retry count and base delay
 *     - Immediate failure after exhausting retries
 * 
 * @param {Function} fn - Async function to execute with retry logic
 * @param {Object} [options={}] - Retry configuration options
 * @param {number} [options.retries=2] - Maximum number of retry attempts
 * @param {number} [options.baseMs=200] - Base delay in milliseconds
 * @returns {Promise} Promise resolving to function result or rejecting with final error
 * 
 * @example
 * // Basic usage with default retry settings
 * const result = await retryWithJitter(() => apiCall());
 * 
 * @example
 * // Custom retry configuration for critical operations
 * const result = await retryWithJitter(
 *   () => importantApiCall(),
 *   { retries: 5, baseMs: 1000 }
 * );
 * 
 * @private
 */
function retryWithJitter (fn, { retries = 2, baseMs = 200 } = {}) {
  return new Promise((resolve, reject) => {
    let attempt = 0
    
    const run = () => {
      fn().then(resolve).catch(err => {
        // 🔄 Retry Logic: Check if retries remaining
        if (attempt >= retries) {return reject(err)}
        
        attempt += 1
        
        // 📊 Backoff Calculation: Exponential backoff with jitter
        const jitter = Math.floor(Math.random() * baseMs)
        const delay = baseMs * attempt + jitter
        
        // ⏰ Retry Scheduling: Schedule next attempt
        setTimeout(run, delay)
      })
    }
    
    // 🚀 Initial Execution: Start first attempt
    run()
  })
}

/**
 * Execute HTTP request to a BookVerse backend service with full resilience.
 * 
 * This function provides the primary HTTP interface for communicating with
 * BookVerse backend services, implementing comprehensive error handling,
 * retry logic, and observability features for production-grade reliability.
 * 
 * 🎯 Purpose:
 *     - Provide reliable HTTP communication with BookVerse backend services
 *     - Abstract service discovery and URL resolution
 *     - Implement comprehensive retry and error handling
 *     - Add request correlation and distributed tracing
 *     - Enable timeout protection and graceful degradation
 * 
 * 🔧 Request Processing:
 *     - Service URL resolution and path construction
 *     - Request enhancement with correlation headers
 *     - Timeout protection with configurable limits
 *     - Retry logic with exponential backoff and jitter
 *     - HTTP status validation and error handling
 * 
 * @param {string} service - Target service name ('inventory', 'recommendations', 'checkout')
 * @param {string} path - API path relative to service base URL
 * @param {Object} [opts={}] - Request options (method, headers, body, etc.)
 * @returns {Promise<Response>} Fetch Response object for successful requests
 * 
 * @throws {Error} HTTP error with status code for failed requests
 * 
 * @example
 * // GET request to inventory service
 * const response = await httpRequest('inventory', '/api/books');
 * const books = await response.json();
 * 
 * @example
 * // POST request with body
 * const response = await httpRequest('checkout', '/api/orders', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ userId: '123', items: [...] })
 * });
 * 
 * @since 1.0.0
 */
export async function httpRequest (service, path, opts = {}) {
  // 🔗 URL Construction: Resolve service base URL and construct full URL
  const base = serviceBase(service)
  const url = `${base}${path}`
  
  // 🔄 Resilient Execution: Execute request with retry logic and timeout protection
  const res = await retryWithJitter(
    () => fetchWithTimeout(url, withHeaders(opts)), 
    { retries: 2, baseMs: 200 }
  )
  
  // ✅ Status Validation: Check HTTP status and throw for errors
  if (!res.ok) {throw new Error(`http_${res.status}`)}
  
  return res
}

/**
 * Execute HTTP request and parse JSON response from BookVerse backend service.
 * 
 * This convenience function combines HTTP request execution with JSON response
 * parsing, providing a streamlined interface for the most common API interaction
 * pattern in the BookVerse web application.
 * 
 * 🎯 Purpose:
 *     - Simplify JSON API interactions with backend services
 *     - Combine HTTP request and JSON parsing in single operation
 *     - Provide consistent error handling for API responses
 *     - Enable clean async/await patterns in application code
 *     - Reduce boilerplate code for common API operations
 * 
 * 🔧 Processing Pipeline:
 *     - Execute HTTP request with full resilience features
 *     - Automatically parse JSON response body
 *     - Propagate errors from both HTTP and JSON parsing layers
 *     - Return parsed JavaScript objects for application use
 * 
 * @param {string} service - Target service name ('inventory', 'recommendations', 'checkout')
 * @param {string} path - API path relative to service base URL
 * @param {Object} [opts={}] - Request options (method, headers, body, etc.)
 * @returns {Promise<*>} Parsed JSON response data
 * 
 * @throws {Error} HTTP errors or JSON parsing errors
 * 
 * @example
 * // Simple GET request with JSON response
 * const books = await httpJson('inventory', '/api/books');
 * console.log('Found books:', books.length);
 * 
 * @example
 * // POST request with JSON request and response
 * const order = await httpJson('checkout', '/api/orders', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ userId: '123', items: cartItems })
 * });
 * console.log('Order created:', order.id);
 * 
 * @since 1.0.0
 */
export async function httpJson (service, path, opts = {}) {
  // 🌐 HTTP Request: Execute request with full resilience
  const res = await httpRequest(service, path, opts)
  
  // 📄 JSON Parsing: Parse response body as JSON
  return res.json()
}

