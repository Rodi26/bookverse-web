import { UserManager, WebStorageStateStore, Log } from 'oidc-client-ts'

// Conditional debug logging - only enable in development
const DEBUG = import.meta.env?.DEV || window.location.hostname === 'localhost'

if (DEBUG) {
  Log.setLogger(console)
  Log.setLevel(Log.INFO)
}

// Debug logging helper
const debugLog = DEBUG ? console.log : () => {}

/**
 * OIDC Authentication Service for BookVerse Web
 *
 * Provides secure authentication using OIDC Authorization Code Flow with PKCE.
 * Supports automatic token refresh and secure storage.
 */
class AuthService {
  constructor() {
    this.userManager = null
    this.user = null
    this.authCallbacks = new Set()
    this.config = null
    this.initialized = false
  }

  /**
   * Initialize the OIDC client with configuration
   * @param {Object} config OIDC configuration
   */
  async initialize(config) {
    if (this.initialized) {
      console.warn('AuthService already initialized')
      return
    }

    this.config = {
      authority: config.authority,
      client_id: config.clientId,
      redirect_uri: `${window.location.origin}/callback`,
      post_logout_redirect_uri: `${window.location.origin}/`,
      response_type: 'code',
      scope: config.scope || 'openid profile email',
      automaticSilentRenew: true,
      silent_redirect_uri: `${window.location.origin}/silent-callback`,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      loadUserInfo: true,
      ...config
    }

    this.userManager = new UserManager(this.config)

    // Set up event handlers
    this.userManager.events.addUserLoaded(this._onUserLoaded.bind(this))
    this.userManager.events.addUserUnloaded(this._onUserUnloaded.bind(this))
    this.userManager.events.addAccessTokenExpiring(this._onTokenExpiring.bind(this))
    this.userManager.events.addAccessTokenExpired(this._onTokenExpired.bind(this))
    this.userManager.events.addSilentRenewError(this._onSilentRenewError.bind(this))

    // Load existing user if any
    try {
      this.user = await this.userManager.getUser()
      if (this.user && !this.user.expired) {
        debugLog('✅ User loaded from storage:', this.user.profile?.email)
        this._notifyAuthCallbacks(true)
      }
    } catch (error) {
      console.error('❌ AUTHENTICATION ERROR: Failed to load user from storage:', error)
      // Clear potentially corrupted auth state
      localStorage.removeItem('oidc.user:' + this.config.authority + ':' + this.config.client_id)
      throw new Error(`Authentication initialization failed: ${error.message}`)
    }

    this.initialized = true
    debugLog('✅ AuthService initialized')
  }

  /**
   * Start the login process
   */
  async login() {
    if (!this.userManager) {
      throw new Error('AuthService not initialized')
    }

    try {
      debugLog('🔐 Starting login process...')
      await this.userManager.signinRedirect()
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Handle login callback
   */
  async handleCallback() {
    if (!this.userManager) {
      throw new Error('AuthService not initialized')
    }

    try {
      debugLog('🔄 Processing login callback...')
      this.user = await this.userManager.signinRedirectCallback()
      debugLog('✅ Login successful:', this.user.profile?.email)
      this._notifyAuthCallbacks(true)
      return this.user
    } catch (error) {
      console.error('Callback error:', error)
      throw error
    }
  }

  /**
   * Handle silent callback for token renewal
   */
  async handleSilentCallback() {
    if (!this.userManager) {
      throw new Error('AuthService not initialized')
    }

    try {
      await this.userManager.signinSilentCallback()
      debugLog('✅ Silent token renewal successful')
    } catch (error) {
      console.error('Silent callback error:', error)
      throw error
    }
  }

  /**
   * Logout the user
   */
  async logout() {
    if (!this.userManager) {
      throw new Error('AuthService not initialized')
    }

    try {
      debugLog('🚪 Logging out...')
      await this.userManager.signoutRedirect()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  /**
   * Get the current access token
   * @returns {string|null} The access token or null if not authenticated
   */
  getAccessToken() {
    return this.user && !this.user.expired ? this.user.access_token : null
  }

  /**
   * Get the current user
   * @returns {Object|null} The user object or null if not authenticated
   */
  getUser() {
    return this.user && !this.user.expired ? this.user : null
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!(this.user && !this.user.expired)
  }

  /**
   * Get user profile information
   * @returns {Object|null} User profile or null if not authenticated
   */
  getUserProfile() {
    return this.user && !this.user.expired ? this.user.profile : null
  }

  /**
   * Register a callback for authentication state changes
   * @param {Function} callback Function to call when auth state changes
   */
  onAuthChanged(callback) {
    this.authCallbacks.add(callback)
    // Call immediately with current state
    callback(this.isAuthenticated())
  }

  /**
   * Unregister an authentication state callback
   * @param {Function} callback Function to remove
   */
  offAuthChanged(callback) {
    this.authCallbacks.delete(callback)
  }

  /**
   * Manually refresh the access token
   */
  async refreshToken() {
    if (!this.userManager) {
      throw new Error('AuthService not initialized')
    }

    try {
      debugLog('🔄 Refreshing token...')
      this.user = await this.userManager.signinSilent()
      debugLog('✅ Token refreshed successfully')
      this._notifyAuthCallbacks(true)
      return this.user
    } catch (error) {
      console.error('Token refresh error:', error)
      this._notifyAuthCallbacks(false)
      throw error
    }
  }

  // Event handlers
  _onUserLoaded(user) {
    debugLog('🔄 User loaded:', user.profile?.email)
    this.user = user
    this._notifyAuthCallbacks(true)
  }

  _onUserUnloaded() {
    debugLog('🔄 User unloaded')
    this.user = null
    this._notifyAuthCallbacks(false)
  }

  _onTokenExpiring() {
    debugLog('⚠️ Token expiring, attempting renewal...')
  }

  _onTokenExpired() {
    debugLog('❌ Token expired')
    this.user = null
    this._notifyAuthCallbacks(false)
  }

  _onSilentRenewError(error) {
    console.error('❌ Silent token renewal failed:', error)
    this._notifyAuthCallbacks(false)
  }

  // Notify all callbacks of auth state change
  _notifyAuthCallbacks(isAuthenticated) {
    this.authCallbacks.forEach(callback => {
      try {
        callback(isAuthenticated)
      } catch (error) {
        console.error('Error in auth callback:', error)
      }
    })
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService
