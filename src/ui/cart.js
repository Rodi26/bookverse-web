import { getCart, clearCart } from '../store/cart.js'
import { createOrder } from '../services/checkout.js'

export function renderCart(rootEl) {
  const cart = getCart()
  const total = cart.items.reduce((s, i) => s + Number(i.unitPrice) * Number(i.qty), 0)
  rootEl.innerHTML = `
  <main class="container">
    <h1>Cart</h1>
    ${cart.items.length === 0 ? '<p>Your cart is empty.</p>' : `
    <table>
      <thead><tr><th align="left">Book</th><th>Qty</th><th align="right">Unit</th><th align="right">Total</th></tr></thead>
      <tbody>
        ${cart.items.map(i => row(i)).join('')}
      </tbody>
    </table>
    <div class="row" style="justify-content:space-between; margin-top:16px;">
      <strong>Grand Total: $${total.toFixed(2)}</strong>
      <button class="btn" id="checkout">Checkout</button>
    </div>`}
    <div id="status" class="muted" style="margin-top:12px;"></div>
  </main>
  `
  const btn = rootEl.querySelector('#checkout')
  if (btn) btn.onclick = async () => {
    btn.disabled = true
    const status = rootEl.querySelector('#status')
    status.textContent = 'Placing order...'
    try {
      const payloadItems = cart.items.map(i => ({ bookId: i.bookId, qty: i.qty, unitPrice: i.unitPrice }))
      const res = await createOrder('demo-user', payloadItems)
      status.textContent = `Order created: ${res.orderId}`
      clearCart()
    } catch (e) {
      status.textContent = `Checkout failed: ${e}`
    } finally {
      btn.disabled = false
    }
  }
}

function row(i) {
  const lt = Number(i.unitPrice) * Number(i.qty)
  return `<tr>
    <td>${i.bookId}</td>
    <td align="center">${i.qty}</td>
    <td align="right">$${Number(i.unitPrice).toFixed(2)}</td>
    <td align="right">$${lt.toFixed(2)}</td>
  </tr>`
}


