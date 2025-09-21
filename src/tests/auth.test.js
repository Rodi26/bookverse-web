import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserManager } from 'oidc-client-ts'
import authService from '../services/auth.js'

// Mock oidc-client-ts
vi.mock('oidc-client-ts', () => ({
  UserManager: vi.fn(),
  WebStorageStateStore: vi.fn(),
  Log: {
    setLogger: vi.fn(),
    setLevel: vi.fn(),
    INFO: 'INFO'
  }
}))

// Mock window and location
const mockLocation = {
  origin: 'http://localhost:3000',
  hash: ''
}

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
})

describe('AuthService', () => {
  let mockUserManager
  let mockUser

  beforeEach(() => {
    // Reset the service state
    authService.userManager = null
    authService.user = null
    authService.initialized = false
    authService.authCallbacks.clear()

    // Create mock user
    mockUser = {
      access_token: 'mock-access-token',
      expired: false,
      profile: {
        email: 'test@example.com',
        name: 'Test User'
      }
    }

    // Create mock UserManager
    mockUserManager = {
      events: {
        addUserLoaded: vi.fn(),
        addUserUnloaded: vi.fn(),
        addAccessTokenExpiring: vi.fn(),
        addAccessTokenExpired: vi.fn(),
        addSilentRenewError: vi.fn()
      },
      getUser: vi.fn().mockResolvedValue(mockUser),
      signinRedirect: vi.fn().mockResolvedValue(undefined),
      signinRedirectCallback: vi.fn().mockResolvedValue(mockUser),
      signinSilentCallback: vi.fn().mockResolvedValue(undefined),
      signoutRedirect: vi.fn().mockResolvedValue(undefined),
      signinSilent: vi.fn().mockResolvedValue(mockUser)
    }

    UserManager.mockImplementation(() => mockUserManager)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should initialize with valid config', async () => {
      const config = {
        authority: 'https://auth.example.com',
        clientId: 'test-client',
        scope: 'openid profile'
      }

      await authService.initialize(config)

      expect(authService.initialized).toBe(true)
      expect(UserManager).toHaveBeenCalledWith(expect.objectContaining({
        authority: config.authority,
        client_id: config.clientId,
        scope: config.scope
      }))
    })

    it('should not reinitialize if already initialized', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }

      await authService.initialize(config)
      const firstCall = UserManager.mock.calls.length

      await authService.initialize(config)

      expect(UserManager.mock.calls.length).toBe(firstCall)
    })

    it('should load existing user on initialization', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }

      await authService.initialize(config)

      expect(mockUserManager.getUser).toHaveBeenCalled()
      expect(authService.user).toEqual(mockUser)
    })

    it('should handle user loading error gracefully', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      mockUserManager.getUser.mockRejectedValue(new Error('Storage error'))

      await authService.initialize(config)

      expect(authService.initialized).toBe(true)
      expect(authService.user).toBeNull()
    })
  })

  describe('authentication methods', () => {
    beforeEach(async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)
    })

    it('should start login process', async () => {
      await authService.login()

      expect(mockUserManager.signinRedirect).toHaveBeenCalled()
    })

    it('should handle login callback', async () => {
      const result = await authService.handleCallback()

      expect(mockUserManager.signinRedirectCallback).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
      expect(authService.user).toEqual(mockUser)
    })

    it('should handle silent callback', async () => {
      await authService.handleSilentCallback()

      expect(mockUserManager.signinSilentCallback).toHaveBeenCalled()
    })

    it('should logout user', async () => {
      await authService.logout()

      expect(mockUserManager.signoutRedirect).toHaveBeenCalled()
    })

    it('should refresh token', async () => {
      const result = await authService.refreshToken()

      expect(mockUserManager.signinSilent).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
      expect(authService.user).toEqual(mockUser)
    })
  })

  describe('user state methods', () => {
    beforeEach(async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)
    })

    it('should return access token when authenticated', () => {
      authService.user = mockUser

      const token = authService.getAccessToken()

      expect(token).toBe('mock-access-token')
    })

    it('should return null when not authenticated', () => {
      authService.user = null

      const token = authService.getAccessToken()

      expect(token).toBeNull()
    })

    it('should return null when token is expired', () => {
      authService.user = { ...mockUser, expired: true }

      const token = authService.getAccessToken()

      expect(token).toBeNull()
    })

    it('should return user when authenticated', () => {
      authService.user = mockUser

      const user = authService.getUser()

      expect(user).toEqual(mockUser)
    })

    it('should return user profile when authenticated', () => {
      authService.user = mockUser

      const profile = authService.getUserProfile()

      expect(profile).toEqual(mockUser.profile)
    })

    it('should check authentication status correctly', () => {
      authService.user = mockUser
      expect(authService.isAuthenticated()).toBe(true)

      authService.user = null
      expect(authService.isAuthenticated()).toBe(false)

      authService.user = { ...mockUser, expired: true }
      expect(authService.isAuthenticated()).toBe(false)
    })
  })

  describe('callback management', () => {
    beforeEach(async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)
    })

    it('should register and call auth callbacks', () => {
      const callback = vi.fn()

      authService.onAuthChanged(callback)

      // Should call immediately with current state
      expect(callback).toHaveBeenCalledWith(true) // mockUser is loaded
    })

    it('should unregister auth callbacks', () => {
      const callback = vi.fn()

      authService.onAuthChanged(callback)
      authService.offAuthChanged(callback)

      // Clear previous calls
      callback.mockClear()

      // Trigger a state change
      authService._notifyAuthCallbacks(false)

      expect(callback).not.toHaveBeenCalled()
    })

    it('should notify all callbacks on state change', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      authService.onAuthChanged(callback1)
      authService.onAuthChanged(callback2)

      // Clear initial calls
      callback1.mockClear()
      callback2.mockClear()

      authService._notifyAuthCallbacks(false)

      expect(callback1).toHaveBeenCalledWith(false)
      expect(callback2).toHaveBeenCalledWith(false)
    })

    it('should handle callback errors gracefully', () => {
      const goodCallback = vi.fn()
      const badCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error')
      })

      authService.onAuthChanged(goodCallback)
      authService.onAuthChanged(badCallback)

      // Clear initial calls
      goodCallback.mockClear()
      badCallback.mockClear()

      // Should not throw despite bad callback
      expect(() => {
        authService._notifyAuthCallbacks(true)
      }).not.toThrow()

      expect(goodCallback).toHaveBeenCalledWith(true)
      expect(badCallback).toHaveBeenCalledWith(true)
    })
  })

  describe('error handling', () => {
    it('should throw error when not initialized', async () => {
      // Don't initialize

      await expect(authService.login()).rejects.toThrow('AuthService not initialized')
      await expect(authService.handleCallback()).rejects.toThrow('AuthService not initialized')
      await expect(authService.logout()).rejects.toThrow('AuthService not initialized')
    })

    it('should handle login errors', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)

      mockUserManager.signinRedirect.mockRejectedValue(new Error('Login failed'))

      await expect(authService.login()).rejects.toThrow('Login failed')
    })

    it('should handle callback errors', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)

      mockUserManager.signinRedirectCallback.mockRejectedValue(new Error('Callback failed'))

      await expect(authService.handleCallback()).rejects.toThrow('Callback failed')
    })

    it('should handle token refresh errors', async () => {
      const config = { authority: 'https://auth.example.com', clientId: 'test' }
      await authService.initialize(config)

      mockUserManager.signinSilent.mockRejectedValue(new Error('Refresh failed'))

      await expect(authService.refreshToken()).rejects.toThrow('Refresh failed')
    })
  })
})

describe('HTTP Service Integration', () => {
  let mockFetch

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    })
    global.fetch = mockFetch

    // Mock crypto.randomUUID
    global.crypto = {
      randomUUID: () => 'test-uuid',
      getRandomValues: (array) => array.fill(1)
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should include Authorization header when authenticated', async () => {
    // Set up authenticated state
    authService.user = {
      access_token: 'test-token',
      expired: false
    }

    const { httpRequest } = await import('../services/http.js')

    await httpRequest('inventory', '/books')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          has: expect.any(Function),
          get: expect.any(Function),
          set: expect.any(Function)
        })
      })
    )

    // Check that Authorization header was set
    const call = mockFetch.mock.calls[0]
    const headers = call[1].headers
    expect(headers.get('Authorization')).toBe('Bearer test-token')
  })

  it('should not include Authorization header when not authenticated', async () => {
    // Set up unauthenticated state
    authService.user = null

    const { httpRequest } = await import('../services/http.js')

    await httpRequest('inventory', '/books')

    const call = mockFetch.mock.calls[0]
    const headers = call[1].headers
    expect(headers.get('Authorization')).toBeNull()
  })
})
