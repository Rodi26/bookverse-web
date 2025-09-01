import { httpJson } from './http.js'

function computeIdempotencyKey(items = []) {
  const norm = items
    .map(i => ({ bookId: i.bookId, qty: Number(i.qty), unitPrice: Number(i.unitPrice) }))
    .sort((a, b) => a.bookId.localeCompare(b.bookId))
  const payload = JSON.stringify(norm)
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 31 + payload.charCodeAt(i)) >>> 0
  }
  return hash.toString(16)
}

export async function createOrder(userId, items) {
  const body = { userId, items }
  const idem = computeIdempotencyKey(items)
  return httpJson('checkout', `/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idem },
    body: JSON.stringify(body),
  })
}

export async function getOrder(orderId) {
  return httpJson('checkout', `/orders/${encodeURIComponent(orderId)}`)
}


