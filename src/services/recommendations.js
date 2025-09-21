import { httpJson } from './http.js'

export async function getSimilar(bookId, limit = 10) {
  const qs = new URLSearchParams({ book_id: bookId, limit: String(limit) })
  return httpJson('', `/api/v1/recommendations/similar?${qs.toString()}`)
}

export async function getTrending(limit = 10) {
  const qs = new URLSearchParams({ limit: String(limit) })
  return httpJson('', `/api/v1/recommendations/trending?${qs.toString()}`)
}

export async function getPersonalized(payload) {
  return httpJson('', '/api/v1/recommendations/personalized', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  })
}

