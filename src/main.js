import { initRouter, navigateTo } from './router.js'
import { renderHome } from './ui/home.js'
import { renderCatalog } from './ui/catalog.js'
import { renderBook } from './ui/book.js'
import { renderCart } from './ui/cart.js'
import { renderLogin, renderCallback, handleAuthCallback, handleSilentCallback, initAuthHandlers } from './ui/auth.js'
import { initReleaseInfo } from './components/releaseInfo.js'
import { httpRequest, httpJson } from './services/http.js'
import { listBooks, getBook } from './services/inventory.js'
import authService from './services/auth.js'

async function bootstrap() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('Missing #app root')
    return
  }

  // Initialize authentication service
  const config = window.__BOOKVERSE_CONFIG__
  if (config?.oidc) {
    try {
      await authService.initialize(config.oidc)
      // Debug: Authentication service initialized
    } catch (error) {
      console.error('❌ Failed to initialize authentication:', error)
    }
  } else {
    console.warn('⚠️ No OIDC configuration found')
  }

  // Initialize router with authentication routes
  initRouter(app, {
    '/': renderCatalog,
    '/home': renderHome,
    '/catalog': renderCatalog,
    '/book/:id': renderBook,
    '/cart': renderCart,
    '/login': renderLogin,
    '/callback': renderCallback,
    '/silent-callback': () => {
      handleSilentCallback()
      return '<div>Silent callback processed</div>'
    }
  })

  // Handle special routes
  const currentPath = location.hash.replace(/^#/, '') || '/'
  if (currentPath === '/callback') {
    await handleAuthCallback()
  } else if (currentPath === '/silent-callback') {
    await handleSilentCallback()
  } else if (!location.hash) {
    navigateTo('/')
  }

  // Initialize authentication UI handlers
  initAuthHandlers()
  
  // Initialize other components
  initReleaseInfo()
  
  // Expose functions globally for debugging and ensure they're available
  window.httpRequest = httpRequest
  window.httpJson = httpJson
  window.listBooks = listBooks
  window.getBook = getBook
  window.navigateTo = navigateTo
  window.authService = authService
  
  // Debug: BookVerse functions exposed globally
}

bootstrap()


