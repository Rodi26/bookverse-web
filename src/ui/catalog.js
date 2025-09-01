import { listBooks } from '../services/inventory.js'
import { debounce } from '../util/debounce.js'
import { addToCart } from '../store/cart.js'
import { navigateTo } from '../router.js'

export function renderCatalog(rootEl) {
  rootEl.innerHTML = layout('Loading...')
  let page = 1
  const perPage = 10
  const state = { query: '' }

  const load = async () => {
    const data = await listBooks(page, perPage)
    const items = data.books || []
    const cards = items
      .filter(it => filterByQuery(it, state.query))
      .map(it => card(it))
      .join('')
    rootEl.innerHTML = layout(cards, data.pagination)
    bind()
  }

  const bind = () => {
    const q = rootEl.querySelector('#q')
    if (q) q.addEventListener('input', debounce(e => { state.query = e.target.value.trim(); load() }, 300))
    const prev = rootEl.querySelector('#prev')
    const next = rootEl.querySelector('#next')
    if (prev) prev.onclick = () => { page = Math.max(1, page - 1); load() }
    if (next) next.onclick = () => { page = page + 1; load() }
    rootEl.querySelectorAll('[data-book-id]').forEach(btn => {
      btn.onclick = () => navigateTo(`/book/${btn.getAttribute('data-book-id')}`)
    })
    rootEl.querySelectorAll('[data-add-id]').forEach(btn => {
      const id = btn.getAttribute('data-add-id')
      const price = Number(btn.getAttribute('data-price') || '0')
      btn.onclick = () => {
        addToCart(id, 1, price)
        btn.textContent = 'Added'
      }
    })
  }

  load()
}

function layout(content, pagination) {
  const p = pagination || { page: 1, pages: 1 }
  return `
  <main class="container">
    <h1>Catalog</h1>
    <input id="q" placeholder="Search title/author" style="margin: 12px 0; padding: 8px; width: 240px;"/>
    <div class="grid cols-auto">
      ${content}
    </div>
    <div class="row" style="margin-top:16px;">
      <button class="btn secondary" id="prev">Prev</button>
      <span class="muted">Page ${p.page} of ${p.pages}</span>
      <button class="btn" id="next">Next</button>
    </div>
  </main>
  `
}

function filterByQuery(it, q) {
  if (!q) return true
  const hay = `${it.title} ${it.authors.join(' ')}`.toLowerCase()
  return hay.includes(q.toLowerCase())
}

function card(it) {
  const price = Number(it.price)
  return `
  <article class="card">
    <img class="cover" src="${it.cover_image_url}" alt="${escapeHtml(it.title)}"/>
    <h3 style="margin:8px 0 4px;">${escapeHtml(it.title)}</h3>
    <p class="muted" style="margin:0 0 8px;">${it.authors.join(', ')}</p>
    <div class="row" style="justify-content:space-between;">
      <button class="btn secondary" data-book-id="${it.id}">View</button>
      <button class="btn" data-add-id="${it.id}" data-price="${price}">Add</button>
    </div>
  </article>
  `
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
}


