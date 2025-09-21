import { getCart, clearCart, removeFromCart } from '../store/cart.js'
import { createOrder } from '../services/checkout.js'
import { getBook } from '../services/inventory.js'
import { navigateTo } from '../router.js'
import { resolveImageUrl } from '../util/imageUrl.js'

export async function renderCart(rootEl) {
  const cart = getCart()
  const total = cart.items.reduce((s, i) => s + Number(i.unitPrice) * Number(i.qty), 0)

  if (cart.items.length === 0) {
    rootEl.innerHTML = emptyCartLayout()
    bindEmptyCart()
    return
  }

  // Fetch book details for cart items
  const bookDetails = {}
  try {
    await Promise.all(cart.items.map(async (item) => {
      try {
        bookDetails[item.bookId] = await getBook(item.bookId)
      } catch {
        bookDetails[item.bookId] = { title: `Book ${item.bookId}`, cover_image_url: '', authors: ['Unknown'] }
      }
    }))
  } catch (e) {
    console.error('Error fetching book details:', e)
  }

  rootEl.innerHTML = cartLayout(cart, total, bookDetails)
  bindCart(cart)
}

function bindEmptyCart() {
  const backBtn = document.querySelector('#back-btn')
  if (backBtn) {
    backBtn.onclick = () => navigateTo('/')
  }
}

function bindCart(cart) {
  const backBtn = document.querySelector('#back-btn')
  const buyBtn = document.querySelector('#buy-now')

  if (backBtn) {
    backBtn.onclick = () => navigateTo('/')
  }

  // Remove buttons
  document.querySelectorAll('[data-remove-id]').forEach(btn => {
    const bookId = btn.getAttribute('data-remove-id')
    btn.onclick = () => {
      removeFromCart(bookId)
      renderCart(document.querySelector('#app > main').parentElement)
    }
  })

  if (buyBtn) {
    buyBtn.onclick = async () => {
      buyBtn.disabled = true
      buyBtn.textContent = 'Processing...'
      const status = document.querySelector('#status')

      try {
        const payloadItems = cart.items.map(i => ({ bookId: i.bookId, qty: i.qty, unitPrice: i.unitPrice }))
        const res = await createOrder('demo-user', payloadItems)

        // Show success message
        status.innerHTML = `
          <div style="background: var(--brand-success); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0 0 8px 0;">🎉 Order Successful!</h3>
            <p style="margin: 0 0 16px 0;">Order ID: ${res.orderId}</p>
            <button class="btn" id="back-home" style="background: white; color: var(--brand-success);">Back to Home</button>
          </div>
        `

        clearCart()

        // Bind back to home button
        document.querySelector('#back-home').onclick = () => navigateTo('/')

      } catch (e) {
        status.innerHTML = `
          <div style="background: var(--brand-danger); color: white; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <strong>Purchase failed:</strong> ${e.message || e}
          </div>
        `
        buyBtn.disabled = false
        buyBtn.textContent = 'Buy Now'
      }
    }
  }
}

function emptyCartLayout() {
  return `
  <main class="container">
    <div style="margin-bottom: 20px;">
      <button id="back-btn" class="btn secondary">← Back to Catalog</button>
    </div>
    
    <div style="text-align: center; padding: 60px 20px;">
      <h1>🛒 Your Cart is Empty</h1>
      <p class="muted" style="font-size: 1.1em; margin: 16px 0 32px 0;">
        Browse our collection and add some books to get started!
      </p>
      <button class="btn" onclick="location.hash = '#/'">Start Shopping</button>
    </div>
  </main>
  `
}

function cartLayout(cart, total, bookDetails) {
  return `
  <main class="container">
    <div style="margin-bottom: 20px;">
      <button id="back-btn" class="btn secondary">← Back to Catalog</button>
    </div>
    
    <h1>🛒 Shopping Cart</h1>
    
    <div class="grid" style="grid-template-columns: 1fr 300px; gap: 24px; align-items: start;">
      <div>
        ${cart.items.map(item => cartItemCard(item, bookDetails[item.bookId])).join('')}
      </div>
      
      <div class="card" style="position: sticky; top: 20px;">
        <h3 style="margin: 0 0 16px 0;">Order Summary</h3>
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 16px;">
          <div class="row" style="justify-content: space-between; margin-bottom: 8px;">
            <span>Subtotal (${cart.items.length} items)</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <div class="row" style="justify-content: space-between; margin-bottom: 8px;">
            <span>Shipping</span>
            <span class="muted">Free</span>
          </div>
          <div class="row" style="justify-content: space-between; margin-bottom: 8px;">
            <span>Tax</span>
            <span>$0.00</span>
          </div>
        </div>
        <div class="row" style="justify-content: space-between; margin-bottom: 20px;">
          <strong style="font-size: 1.2em;">Total</strong>
          <strong style="font-size: 1.2em; color: var(--brand);">$${total.toFixed(2)}</strong>
        </div>
        <button class="btn" id="buy-now" style="width: 100%; padding: 14px; font-size: 16px; font-weight: 600;">
          Buy Now
        </button>
      </div>
    </div>
    
    <div id="status"></div>
  </main>
  `
}

function cartItemCard(item, book) {
  const lineTotal = Number(item.unitPrice) * Number(item.qty)
  return `
  <div class="card" style="margin-bottom: 16px;">
    <div style="display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; align-items: center;">
      <img src="${book?.cover_image_url ? resolveImageUrl(book.cover_image_url, window.__BOOKVERSE_CONFIG__.inventoryBaseUrl) : ''}" alt="${book?.title || item.bookId}" 
           style="width: 80px; height: 120px; object-fit: cover; border-radius: 8px;"/>
      <div>
        <h4 style="margin: 0 0 4px 0;">${book?.title || item.bookId}</h4>
        <p class="muted" style="margin: 0 0 8px 0;">${book?.authors?.join(', ') || 'Unknown Author'}</p>
        <div class="row" style="gap: 16px;">
          <span>Qty: ${item.qty}</span>
          <span>$${Number(item.unitPrice).toFixed(2)} each</span>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-weight: 600; font-size: 1.1em; margin-bottom: 8px;">
          $${lineTotal.toFixed(2)}
        </div>
        <button class="btn remove" data-remove-id="${item.bookId}" style="padding: 6px 12px; font-size: 14px;">
          🗑️ Remove
        </button>
      </div>
    </div>
  </div>
  `
}

