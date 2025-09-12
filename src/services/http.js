// Circuit breaker removed - was causing more issues than benefits
// Modern browsers and Kubernetes provide sufficient resilience

import authService from './auth.js'

function serviceBase(service) {
  const cfg = window.__BOOKVERSE_CONFIG__ || {}
  if (service === 'inventory') return cfg.inventoryBaseUrl || ''
  if (service === 'recommendations') return cfg.recommendationsBaseUrl || ''
  if (service === 'checkout') return cfg.checkoutBaseUrl || ''
  return ''
}

function withHeaders(opts = {}) {
  const headers = new Headers(opts.headers || {})
  headers.set('X-Request-Id', crypto.randomUUID())
  
  // Add authentication token if available
  const token = authService.getAccessToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  // Minimal traceparent: version 00, random 16-byte trace id, 8-byte span id
  const traceId = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('')
  const spanId = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('')
  headers.set('traceparent', `00-${traceId}-${spanId}-01`)
  return { ...opts, headers }
}

function fetchWithTimeout(url, opts = {}, timeoutMs = 2500) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(t))
}

function retryWithJitter(fn, { retries = 2, baseMs = 200 } = {}) {
  return new Promise((resolve, reject) => {
    let attempt = 0
    const run = () => {
      fn().then(resolve).catch(err => {
        if (attempt >= retries) return reject(err)
        attempt += 1
        const jitter = Math.floor(Math.random() * baseMs)
        setTimeout(run, baseMs * attempt + jitter)
      })
    }
    run()
  })
}

export async function httpRequest(service, path, opts = {}) {
  const base = serviceBase(service)
  const url = `${base}${path}`
  try {
    const res = await retryWithJitter(() => fetchWithTimeout(url, withHeaders(opts)), { retries: 2, baseMs: 200 })
    if (!res.ok) throw new Error(`http_${res.status}`)
    return res
  } catch (e) {
    throw e
  }
}

export async function httpJson(service, path, opts = {}) {
  const res = await httpRequest(service, path, opts)
  return res.json()
}


