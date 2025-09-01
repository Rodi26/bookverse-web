import { getBook } from '../services/inventory.js'
import { getSimilar } from '../services/recommendations.js'
import { addToCart } from '../store/cart.js'

export async function renderBook(rootEl, params) {
  const { id } = params
  rootEl.innerHTML = `<main class="container"><h1>Loading...</h1></main>`
  try {
    const [book, recs] = await Promise.all([
      getBook(id),
      getSimilar(id, 8).catch(() => ({ recommendations: [] })),
    ])
    rootEl.innerHTML = layout(book, recs.recommendations || [])
    const add = rootEl.querySelector('#add')
    if (add) add.onclick = () => { addToCart(book.id, 1, Number(book.price)); add.textContent = 'Added' }
  } catch (e) {
    rootEl.innerHTML = `<main class="container"><h1>Not Found</h1></main>`
  }
}

function layout(book, recommendations) {
  return `
  <main class="container" style="display:grid; grid-template-columns: 280px 1fr; gap:24px;">
    <div>
      <img src="${book.cover_image_url}" alt="${escapeHtml(book.title)}" style="width:100%; border-radius:8px;"/>
    </div>
    <div>
      <h1>${escapeHtml(book.title)}</h1>
      <p class="muted">${book.authors.join(', ')}</p>
      <p>${escapeHtml(book.description)}</p>
      <div class="row" style="margin: 12px 0;">
        <strong>$${Number(book.price).toFixed(2)}</strong>
        <button class="btn" id="add">Add to cart</button>
      </div>
      <h3>Similar</h3>
      <div class="grid cols-recs">
        ${recommendations.map(r => `<div class=\"card\"><img class=\"cover\" style=\"height:140px;\" src=\"${r.coverImageUrl}\" alt=\"${escapeHtml(r.title)}\"/><div style=\"font-weight:600; margin-top:6px;\">${escapeHtml(r.title)}</div></div>`).join('')}
      </div>
    </div>
  </main>
  `
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
}


