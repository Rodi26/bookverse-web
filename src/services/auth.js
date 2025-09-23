import { UserManager, WebStorageStateStore, Log } from 'oidc-client-ts'


const DEBUG = import.meta.env?.DEV || window.location.hostname === 'localhost'

if (DEBUG) {
  Log.setLogger(console)
  Log.setLevel(Log.INFO)
}


const debugLog = DEBUG ? console.log : () => {}


class AuthService {
  constructor() {
    this.userManager = null
    this.user = null
    this.authCallbacks = new Set()
    this.config = null
    this.initialized = false
  }


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


    this.userManager.events.addUserLoaded(this._onUserLoaded.bind(this))
    this.userManager.events.addUserUnloaded(this._onUserUnloaded.bind(this))
    this.userManager.events.addAccessTokenExpiring(this._onTokenExpiring.bind(this))
    this.userManager.events.addAccessTokenExpired(this._onTokenExpired.bind(this))
    this.userManager.events.addSilentRenewError(this._onSilentRenewError.bind(this))


    try {
      this.user = await this.userManager.getUser()
      if (this.user && !this.user.expired) {
        debugLog('✅ User loaded from storage:', this.user.profile?.email)
        this._notifyAuthCallbacks(true)
      }
    } catch (error) {
      console.error('❌ AUTHENTICATION ERROR: Failed to load user from storage:', error)

      localStorage.removeItem('oidc.user:' + this.config.authority + ':' + this.config.client_id)
      throw new Error(`Authentication initialization failed: ${error.message}`)
    }

    this.initialized = true
    debugLog('✅ AuthService initialized')
  }


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


  getAccessToken() {
    return this.user && !this.user.expired ? this.user.access_token : null
  }


  getUser() {
    return this.user && !this.user.expired ? this.user : null
  }


  isAuthenticated() {
    return !!(this.user && !this.user.expired)
  }


  getUserProfile() {
    return this.user && !this.user.expired ? this.user.profile : null
  }


  onAuthChanged(callback) {
    this.authCallbacks.add(callback)

    callback(this.isAuthenticated())
  }


  offAuthChanged(callback) {
    this.authCallbacks.delete(callback)
  }


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


const authService = new AuthService()

export default authService
