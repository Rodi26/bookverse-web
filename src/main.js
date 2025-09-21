import { initRouter, navigateTo } from './router.js'
import { renderHome } from './ui/home.js'
import { renderCatalog } from './ui/catalog.js'
import { renderBook } from './ui/book.js'
import { renderCart } from './ui/cart.js'
// Auth imports removed for demo
import { initReleaseInfo } from './components/releaseInfo.js'
import { httpRequest, httpJson } from './services/http.js'
import { listBooks, getBook } from './services/inventory.js'
// Auth service removed for demo

async function bootstrap() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('Missing #app root')
    return
  }

  // Authentication disabled for demo
  console.log('🎯 Demo mode: Authentication disabled')

  // Initialize router (demo mode - no authentication)
  initRouter(app, {
    '/': renderCatalog,
    '/home': renderHome,
    '/catalog': renderCatalog,
    '/book/:id': renderBook,
    '/cart': renderCart
  })

  // Initialize default route for demo
  if (!location.hash) {
    navigateTo('/')
  }

  // Initialize other components
  initReleaseInfo()

  // Expose functions globally for debugging and ensure they're available
  window.httpRequest = httpRequest
  window.httpJson = httpJson
  window.listBooks = listBooks
  window.getBook = getBook
  window.navigateTo = navigateTo
  // authService removed for demo

  // Debug: BookVerse functions exposed globally
}

bootstrap()
