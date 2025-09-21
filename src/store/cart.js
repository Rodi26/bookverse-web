const KEY = 'bookverse.cart.v1'

export function getCart() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    return { items: [] }
  }
}

export function saveCart(cart) {
  localStorage.setItem(KEY, JSON.stringify(cart || { items: [] }))
}

export function addToCart(bookId, qty, unitPrice) {
  const cart = getCart()
  const existing = cart.items.find(i => i.bookId === bookId)
  if (existing) existing.qty += qty
  else cart.items.push({ bookId, qty, unitPrice })
  saveCart(cart)
  return cart
}

export function removeFromCart(bookId) {
  const cart = getCart()
  cart.items = cart.items.filter(item => item.bookId !== bookId)
  saveCart(cart)
  return cart
}

export function clearCart() {
  saveCart({ items: [] })
}

export function isInCart(bookId) {
  const cart = getCart()
  return cart.items.some(item => item.bookId === bookId)
}

