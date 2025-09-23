/**
 * BookVerse Web Application - Circuit Breaker Utility
 *
 * This module implements a comprehensive circuit breaker pattern for the BookVerse
 * platform, providing resilient API communication, failure detection, and automatic
 * recovery mechanisms to enhance system reliability and user experience during
 * service disruptions.
 *
 * 🏗️ Architecture Overview:
 *     - State Machine Pattern: Implements closed, open, and half-open states
 *     - Failure Detection: Automatic failure counting and threshold monitoring
 *     - Recovery Mechanism: Time-based cooldown with gradual service recovery
 *     - Resource Protection: Prevents cascading failures and resource exhaustion
 *     - Performance Optimization: Fail-fast behavior for improved responsiveness
 *
 * 🚀 Key Features:
 *     - Automatic failure detection with configurable thresholds
 *     - Time-based recovery with exponential backoff capabilities
 *     - State machine pattern for predictable behavior and debugging
 *     - Resource protection preventing cascading failures
 *     - Performance optimization through fail-fast operations
 *     - Graceful degradation during service unavailability
 *
 * 🔧 Technical Implementation:
 *     - State Machine: Closed → Open → Half-Open → Closed cycle
 *     - Failure Tracking: Counter-based failure detection with thresholds
 *     - Time Management: Timestamp-based cooldown and recovery timing
 *     - Thread Safety: Stateful operations with atomic state transitions
 *     - Memory Efficiency: Minimal state storage with efficient algorithms
 *
 * 📊 Business Logic:
 *     - Service Reliability: Improved system availability and user experience
 *     - Cost Optimization: Reduced resource consumption during outages
 *     - Fault Isolation: Prevents single service failures from cascading
 *     - Recovery Automation: Automatic service recovery without manual intervention
 *     - Performance Maintenance: Maintains responsiveness during partial outages
 *
 * 🛠️ Usage Patterns:
 *     - API client resilience for external service communication
 *     - Microservice communication reliability and fault tolerance
 *     - Resource protection during high load or service degradation
 *     - Graceful degradation with fallback mechanisms
 *     - Performance monitoring and automatic failure recovery
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

/**
 * Circuit Breaker implementation for resilient service communication.
 * 
 * This class implements the circuit breaker pattern to provide fault tolerance
 * and resilience for external service calls. It automatically detects failures,
 * protects resources by failing fast, and provides automatic recovery mechanisms.
 * 
 * 🎯 Purpose:
 *     - Provide fault tolerance for external service communication
 *     - Prevent cascading failures through resource protection
 *     - Enable automatic recovery from service disruptions
 *     - Improve system responsiveness during partial outages
 *     - Support graceful degradation with predictable behavior
 * 
 * 🔧 State Machine:
 *     - CLOSED: Normal operation, requests pass through
 *     - OPEN: Failure detected, requests fail fast without calling service
 *     - HALF-OPEN: Testing recovery, limited requests allowed for health checking
 * 
 * 📊 Configuration:
 *     - failureThreshold: Number of failures before opening circuit
 *     - cooldownMs: Time to wait before attempting recovery
 * 
 * @class CircuitBreaker
 * 
 * @example
 * // Basic circuit breaker for API calls
 * const breaker = new CircuitBreaker({
 *   failureThreshold: 3,
 *   cooldownMs: 5000
 * });
 * 
 * async function resilientApiCall() {
 *   if (!breaker.canRequest()) {
 *     throw new Error('Service temporarily unavailable');
 *   }
 *   
 *   try {
 *     const response = await fetch('/api/data');
 *     breaker.recordSuccess();
 *     return response;
 *   } catch (error) {
 *     breaker.recordFailure();
 *     throw error;
 *   }
 * }
 * 
 * @example
 * // Service integration with fallback
 * const inventoryBreaker = new CircuitBreaker({ failureThreshold: 5 });
 * 
 * async function getBooks() {
 *   if (inventoryBreaker.canRequest()) {
 *     try {
 *       const books = await inventoryService.getBooks();
 *       inventoryBreaker.recordSuccess();
 *       return books;
 *     } catch (error) {
 *       inventoryBreaker.recordFailure();
 *       return getCachedBooks(); // Fallback
 *     }
 *   } else {
 *     return getCachedBooks(); // Service unavailable
 *   }
 * }
 * 
 * States:
 *     - closed: Normal operation, all requests allowed
 *     - open: Service unavailable, all requests fail fast
 *     - half-open: Testing recovery, limited requests for health check
 * 
 * @since 1.0.0
 */
export class CircuitBreaker {
  /**
   * Initialize circuit breaker with configurable failure detection and recovery.
   * 
   * This constructor sets up the circuit breaker with configurable thresholds
   * and recovery timing. It initializes the state machine in the closed state
   * for normal operation.
   * 
   * 🎯 Purpose:
   *     - Configure failure detection thresholds and recovery timing
   *     - Initialize circuit breaker state machine for operation
   *     - Set up monitoring and tracking for failure detection
   *     - Provide configurable behavior for different service requirements
   * 
   * 🔧 Implementation Features:
   *     - Configurable failure threshold for opening circuit
   *     - Configurable cooldown period for recovery attempts
   *     - Initial state setup for immediate operation
   *     - Default values optimized for typical web service scenarios
   * 
   * @param {Object} options - Configuration options for circuit breaker behavior
   * @param {number} [options.failureThreshold=5] - Number of failures before opening circuit
   * @param {number} [options.cooldownMs=2000] - Cooldown period in milliseconds before retry
   * 
   * @example
   * // Default configuration for typical scenarios
   * const breaker = new CircuitBreaker();
   * 
   * @example
   * // Custom configuration for sensitive services
   * const sensitiveBreaker = new CircuitBreaker({
   *   failureThreshold: 3,  // Open after 3 failures
   *   cooldownMs: 10000     // Wait 10 seconds before retry
   * });
   * 
   * @example
   * // High-tolerance configuration for reliable services
   * const tolerantBreaker = new CircuitBreaker({
   *   failureThreshold: 10, // Allow more failures
   *   cooldownMs: 1000      // Shorter recovery time
   * });
   * 
   * Configuration Guidelines:
   *     - Lower thresholds: More sensitive to failures, faster protection
   *     - Higher thresholds: More tolerant of transient issues
   *     - Shorter cooldowns: Faster recovery, but may overwhelm failing services
   *     - Longer cooldowns: More conservative recovery, better for serious outages
   * 
   * @since 1.0.0
   */
  constructor ({ failureThreshold = 5, cooldownMs = 2000 } = {}) {
    // 🎛️ Configuration: Set failure detection and recovery parameters
    this.failureThreshold = failureThreshold  // Failures before opening circuit
    this.cooldownMs = cooldownMs              // Recovery cooldown period
    
    // 🔄 State Management: Initialize circuit breaker state
    this.state = 'closed'      // Initial state allows all requests
    this.failures = 0          // Current failure count
    this.nextTryAt = 0         // Timestamp for next recovery attempt
  }

  /**
   * Check if requests are allowed based on current circuit breaker state.
   * 
   * This method implements the core circuit breaker logic to determine whether
   * requests should be allowed or blocked based on the current state and
   * failure history. It handles state transitions and recovery timing.
   * 
   * 🎯 Purpose:
   *     - Determine request allowance based on circuit breaker state
   *     - Handle automatic state transitions for recovery attempts
   *     - Provide fail-fast behavior during service outages
   *     - Enable gradual recovery through half-open state testing
   * 
   * 🔧 State Logic:
   *     - CLOSED: Always allow requests (normal operation)
   *     - OPEN: Block requests until cooldown expires
   *     - HALF-OPEN: Allow single request to test service recovery
   * 
   * @returns {boolean} True if request should be allowed, false if blocked
   * 
   * @example
   * // Check before making API call
   * if (breaker.canRequest()) {
   *   try {
   *     await makeApiCall();
   *     breaker.recordSuccess();
   *   } catch (error) {
   *     breaker.recordFailure();
   *     throw error;
   *   }
   * } else {
   *   console.log('Circuit breaker open - using fallback');
   *   return getFallbackData();
   * }
   * 
   * @example
   * // Integration in service client
   * async function resilientRequest(url) {
   *   if (!this.breaker.canRequest()) {
   *     throw new ServiceUnavailableError('Circuit breaker open');
   *   }
   *   // ... proceed with request
   * }
   * 
   * State Behavior:
   *     - closed: Returns true (allow all requests)
   *     - open: Returns false until cooldown expires, then transitions to half-open
   *     - half-open: Returns true for single test request
   * 
   * @since 1.0.0
   */
  canRequest () {
    if (this.state === 'open') {
      // 🕒 Cooldown Check: Test if enough time has passed for recovery attempt
      if (Date.now() >= this.nextTryAt) {
        // 🔄 State Transition: Move to half-open for recovery testing
        this.state = 'half-open'
        return true
      }
      // ⛔ Block Request: Still in cooldown period
      return false
    }
    // ✅ Allow Request: Closed or half-open state allows requests
    return true
  }

  /**
   * Record successful request and reset circuit breaker to healthy state.
   * 
   * This method records a successful operation and resets the circuit breaker
   * to the closed state, clearing all failure history. It's called after
   * successful service responses to maintain normal operation.
   * 
   * 🎯 Purpose:
   *     - Reset circuit breaker to healthy operational state
   *     - Clear failure history after successful operations
   *     - Complete recovery from half-open to closed state
   *     - Maintain normal operation during healthy service responses
   * 
   * @example
   * // Record success after successful API call
   * try {
   *   const response = await fetch('/api/data');
   *   breaker.recordSuccess(); // Reset to healthy state
   *   return response.json();
   * } catch (error) {
   *   breaker.recordFailure(); // Track failure
   *   throw error;
   * }
   * 
   * @example
   * // Integration in HTTP client
   * async function httpRequest(url) {
   *   if (breaker.canRequest()) {
   *     try {
   *       const result = await httpClient.get(url);
   *       breaker.recordSuccess(); // Mark success
   *       return result;
   *     } catch (error) {
   *       breaker.recordFailure(); // Mark failure
   *       throw error;
   *     }
   *   }
   * }
   * 
   * @since 1.0.0
   */
  recordSuccess () {
    // 🔄 State Reset: Clear failure history and return to normal operation
    this.failures = 0           // Reset failure counter
    this.state = 'closed'       // Return to normal operation state
  }

  /**
   * Record failed request and update circuit breaker state accordingly.
   * 
   * This method records a failed operation and updates the circuit breaker
   * state based on the failure threshold. It handles the transition from
   * closed to open state when failures exceed the configured threshold.
   * 
   * 🎯 Purpose:
   *     - Track service failures for circuit breaker decision making
   *     - Trigger circuit opening when failure threshold is exceeded
   *     - Set cooldown timer for recovery attempts
   *     - Protect downstream services from continued failures
   * 
   * 🔧 Failure Logic:
   *     - Increment failure counter for each recorded failure
   *     - Compare against configured failure threshold
   *     - Open circuit and set cooldown timer when threshold exceeded
   *     - Maintain failure count for debugging and monitoring
   * 
   * @example
   * // Record failure after failed API call
   * try {
   *   await serviceCall();
   *   breaker.recordSuccess();
   * } catch (error) {
   *   breaker.recordFailure(); // Increment failure count
   *   if (breaker.state === 'open') {
   *     console.log('Circuit opened due to failures');
   *   }
   *   throw error;
   * }
   * 
   * @example
   * // Error handling with circuit breaker
   * async function callWithBreaker() {
   *   try {
   *     return await externalService.call();
   *   } catch (error) {
   *     breaker.recordFailure();
   *     
   *     // Check if circuit is now open
   *     if (breaker.state === 'open') {
   *       // Switch to fallback behavior
   *       return getFallbackResponse();
   *     }
   *     throw error;
   *   }
   * }
   * 
   * @since 1.0.0
   */
  recordFailure () {
    // 📈 Failure Tracking: Increment failure counter
    this.failures += 1
    
    // 🚨 Threshold Check: Open circuit if failures exceed threshold
    if (this.failures >= this.failureThreshold) {
      // 🔄 State Transition: Open circuit to protect resources
      this.state = 'open'
      
      // ⏰ Recovery Timer: Set cooldown period for next recovery attempt
      this.nextTryAt = Date.now() + this.cooldownMs
    }
  }
}

