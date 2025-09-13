import { httpJson } from './http.js'

export async function listBooks(page = 1, perPage = 10) {
  return httpJson('', `/api/v1/books?page=${page}&per_page=${perPage}`)
}

export async function getBook(bookId) {
  return httpJson('', `/api/v1/books/${encodeURIComponent(bookId)}`)
}

export async function listInventory(page = 1, perPage = 10, lowStock = false) {
  const qs = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (lowStock) qs.set('low_stock', 'true')
  return httpJson('', `/api/v1/inventory?${qs.toString()}`)
}


