import { initRouter, navigateTo } from './router.js'
import { renderHome } from './ui/home.js'
import { renderCatalog } from './ui/catalog.js'
import { renderBook } from './ui/book.js'
import { renderCart } from './ui/cart.js'
import { initReleaseInfo } from './components/releaseInfo.js'
import { httpRequest, httpJson } from './services/http.js'
import { listBooks, getBook } from './services/inventory.js'

function bootstrap() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('Missing #app root')
    return
  }
  initRouter(app, {
    '/': renderCatalog,
    '/home': renderHome,
    '/catalog': renderCatalog,
    '/book/:id': renderBook,
    '/cart': renderCart,
  })

  if (!location.hash) navigateTo('/')
  initReleaseInfo()
  
  // Expose functions globally for debugging and ensure they're available
  window.httpRequest = httpRequest
  window.httpJson = httpJson
  window.listBooks = listBooks
  window.getBook = getBook
  window.navigateTo = navigateTo
  
  console.log('✅ BookVerse functions exposed globally')
}

bootstrap()


