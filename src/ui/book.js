import { getBook } from '../services/inventory.js'
import { addToCart, removeFromCart, isInCart, getCart } from '../store/cart.js'
import { navigateTo } from '../router.js'
import { resolveImageUrl } from '../util/imageUrl.js'

export async function renderBook(rootEl, params) {
  const { id } = params
  rootEl.innerHTML = '<main class="container"><h1>Loading...</h1></main>'
  try {
    const book = await getBook(id)
    rootEl.innerHTML = layout(book)
    bind(book)
  } catch {
    rootEl.innerHTML = '<main class="container"><h1>Not Found</h1></main>'
  }
}

function bind(book) {
  const homeBtn = document.querySelector('#home-btn')
  const cartBtn = document.querySelector('#cart-btn')
  const recsBtn = document.querySelector('#recommendations-btn')
  const addBtn = document.querySelector('#add')

  if (homeBtn) {
    homeBtn.onclick = () => navigateTo('/')
  }

  if (cartBtn) {
    cartBtn.onclick = () => navigateTo('/cart')
    updateCartCount()
  }

  if (recsBtn) {
    recsBtn.onclick = () => {
      navigateTo('/')

      setTimeout(() => {
        const recommendationsBtn = document.querySelector('#recommendations-btn')
        if (recommendationsBtn) recommendationsBtn.click()
      }, 100)
    }
  }

  if (addBtn) {
    updateAddButtonState(book.id)
    addBtn.onclick = () => {
      if (isInCart(book.id)) {
        removeFromCart(book.id)
      } else {
        addToCart(book.id, 1, Number(book.price))
      }
      updateAddButtonState(book.id)
      updateCartCount()
    }
  }
}

function updateAddButtonState(bookId) {
  const addBtn = document.querySelector('#add')
  if (addBtn) {
    if (isInCart(bookId)) {
      addBtn.textContent = 'Remove from Cart'
      addBtn.classList.add('remove')
    } else {
      addBtn.textContent = 'Add to Cart'
      addBtn.classList.remove('remove')
    }
  }
}

function updateCartCount() {
  const cartBtn = document.querySelector('#cart-btn')
  if (cartBtn) {
    const cart = getCart()
    const count = cart.items.length
    cartBtn.textContent = count > 0 ? `Cart (${count})` : 'Cart'
  }
}

function renderRating(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  let stars = ''
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star">★</span>'
  }
  if (hasHalfStar) {
    stars += '<span class="star">☆</span>'
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star empty">☆</span>'
  }

  return `<div class="rating">${stars} <span class="muted">(${rating})</span></div>`
}

function layout(book) {
  const rating = book.rating || 0
  return `
  <main class="container">
    <nav class="global-nav">
      <div class="nav-brand">📚 BookVerse</div>
      <div class="nav-links">
        <button id="home-btn" class="nav-btn">Home</button>
        <button id="recommendations-btn" class="nav-btn">Recommendations</button>
        <button id="cart-btn" class="nav-btn cart-btn">Cart</button>
      </div>
    </nav>
    
    <div style="display:grid; grid-template-columns: 300px 1fr; gap:32px; align-items: start;">
      <div>
        <img src="${resolveImageUrl(book.cover_image_url, window.__BOOKVERSE_CONFIG__.inventoryBaseUrl)}" alt="${escapeHtml(book.title)}" style="width:100%; border-radius:12px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);"/>
      </div>
      <div>
        <h1 style="margin: 0 0 8px 0; font-size: 2.2em;">${escapeHtml(book.title)}</h1>
        ${book.subtitle ? `<h2 style="margin: 0 0 12px 0; font-size: 1.3em; color: var(--muted); font-weight: 400;">${escapeHtml(book.subtitle)}</h2>` : ''}
        <p style="margin: 0 0 8px 0; font-size: 1.1em; color: var(--brand);">by ${book.authors.join(', ')}</p>
        ${renderRating(rating)}
        <div class="price" style="font-size: 24px; margin: 16px 0;">$${Number(book.price).toFixed(2)}</div>
        <p style="line-height: 1.6; margin: 16px 0; font-size: 1.05em;">${escapeHtml(book.description)}</p>
        <div style="margin: 24px 0;">
          <button class="btn" id="add" style="padding: 14px 28px; font-size: 16px;">Add to Cart</button>
        </div>
        ${book.genres && book.genres.length > 0 ? `
        <div style="margin-top: 20px;">
          <h4 style="margin: 0 0 8px 0; color: var(--muted);">Genres:</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${book.genres.map(genre => `<span style="background: var(--panel); border: 1px solid var(--border); padding: 4px 12px; border-radius: 20px; font-size: 0.9em; color: var(--text);">${escapeHtml(genre)}</span>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </div>
  </main>
  `
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
}
