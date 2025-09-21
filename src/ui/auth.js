import authService from '../services/auth.js'
import { navigateTo } from '../router.js'

/**
 * Login Page Component
 * Displays login button and handles OIDC authentication
 */
export function renderLogin() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1>Welcome to BookVerse</h1>
          <p>Please sign in to continue</p>
        </div>
        
        <div class="login-content">
          <button id="login-btn" class="login-button">
            <svg class="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h6v18h-6"></path>
              <path d="M10 17l5-5-5-5"></path>
              <path d="M3 12h13"></path>
            </svg>
            Sign in with BookVerse ID
          </button>
          
          <div class="login-info">
            <p>Secure authentication powered by OIDC</p>
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Authentication Status Component
 * Shows current user info and logout option
 */
export function renderAuthStatus() {
  const user = authService.getUserProfile()

  if (!user) {
    return `
      <div class="auth-status">
        <button id="auth-login-btn" class="auth-button">Sign In</button>
      </div>
    `
  }

  return `
    <div class="auth-status authenticated">
      <div class="user-info">
        <div class="user-avatar">
          ${user.picture ?
    `<img src="${user.picture}" alt="${user.name || user.email}" />` :
    `<div class="avatar-placeholder">${(user.name || user.email || 'U').charAt(0).toUpperCase()}</div>`
}
        </div>
        <div class="user-details">
          <span class="user-name">${user.name || user.email}</span>
          <span class="user-email">${user.email}</span>
        </div>
      </div>
      <div class="auth-actions">
        <button id="auth-logout-btn" class="auth-button logout">Sign Out</button>
      </div>
    </div>
  `
}

/**
 * Callback Page Component
 * Handles OIDC callback processing
 */
export function renderCallback() {
  return `
    <div class="callback-container">
      <div class="callback-card">
        <div class="loading-spinner"></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we process your authentication.</p>
      </div>
    </div>
  `
}

/**
 * Authentication Guard
 * Redirects to login if user is not authenticated
 */
export function requireAuth() {
  if (!authService.isAuthenticated()) {
    navigateTo('/login')
    return false
  }
  return true
}

/**
 * Initialize authentication event handlers
 */
export function initAuthHandlers() {
  // Login button handler
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'login-btn' || e.target.id === 'auth-login-btn') {
      e.preventDefault()
      try {
        await authService.login()
      } catch (error) {
        console.error('Login failed:', error)
        showErrorMessage('Login failed. Please try again.')
      }
    }

    // Logout button handler
    if (e.target.id === 'auth-logout-btn') {
      e.preventDefault()
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout failed:', error)
        showErrorMessage('Logout failed. Please try again.')
      }
    }
  })

  // Listen for auth state changes
  authService.onAuthChanged((isAuthenticated) => {
    updateAuthUI(isAuthenticated)
  })
}

/**
 * Update authentication UI based on auth state
 */
function updateAuthUI(isAuthenticated) {
  const authContainer = document.querySelector('.auth-status')
  if (authContainer) {
    authContainer.outerHTML = renderAuthStatus()
  }

  // Redirect to home if logged in on login page
  if (isAuthenticated && window.location.hash === '#/login') {
    navigateTo('/')
  }
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
  // Create or update error toast
  let toast = document.querySelector('.error-toast')
  if (!toast) {
    toast = document.createElement('div')
    toast.className = 'error-toast'
    document.body.appendChild(toast)
  }

  toast.textContent = message
  toast.classList.add('show')

  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show')
  }, 5000)
}

/**
 * Handle OIDC callback processing
 */
export async function handleAuthCallback() {
  try {
    const _user = await authService.handleCallback()
    // Debug: Authentication callback successful

    // Redirect to intended page or home
    const returnUrl = sessionStorage.getItem('returnUrl') || '/'
    sessionStorage.removeItem('returnUrl')
    navigateTo(returnUrl)

  } catch (error) {
    console.error('❌ Authentication callback failed:', error)
    showErrorMessage('Authentication failed. Please try again.')
    navigateTo('/login')
  }
}

/**
 * Handle silent callback for token renewal
 */
export async function handleSilentCallback() {
  try {
    await authService.handleSilentCallback()
    // Debug: Silent authentication callback successful
  } catch (error) {
    console.error('❌ AUTHENTICATION ERROR: Silent authentication callback failed:', error)
    // Force user to re-authenticate
    showErrorMessage('Session expired. Please log in again.')
    await authService.logout()
    navigateTo('/login')
  }
}
