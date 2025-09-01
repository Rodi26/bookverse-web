import { initRouter, navigateTo } from './router.js'
import { renderHome } from './ui/home.js'
import { renderCatalog } from './ui/catalog.js'
import { renderBook } from './ui/book.js'
import { renderCart } from './ui/cart.js'
import { attachTrustPanel } from './trust/panel.js'

function bootstrap() {
  const app = document.getElementById('app')
  if (!app) {
    console.error('Missing #app root')
    return
  }
  initRouter(app, {
    '/': renderHome,
    '/catalog': renderCatalog,
    '/book/:id': renderBook,
    '/cart': renderCart,
  })

  if (!location.hash) navigateTo('/')
  attachTrustPanel()
}

bootstrap()


