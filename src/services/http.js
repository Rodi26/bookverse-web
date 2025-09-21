// Circuit breaker removed - was causing more issues than benefits
// Modern browsers and Kubernetes provide sufficient resilience

// Auth service removed for demo

function serviceBase(service) {
  // If service is empty, use relative URLs (nginx proxy handles routing)
  if (!service) return ''

  const cfg = window.__BOOKVERSE_CONFIG__ || {}
  if (service === 'inventory') return cfg.inventoryBaseUrl || ''
  if (service === 'recommendations') return cfg.recommendationsBaseUrl || ''
  if (service === 'checkout') return cfg.checkoutBaseUrl || ''
  return ''
}

// Generate UUID with fallback for older browsers
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function withHeaders(opts = {}) {
  const headers = new Headers(opts.headers || {})
  headers.set('X-Request-Id', generateUUID())

  // Authentication disabled for demo
  // No authorization headers needed

  // Minimal traceparent: version 00, random 16-byte trace id, 8-byte span id
  const traceId = generateUUID().replace(/-/g, '').substring(0, 32)
  const spanId = generateUUID().replace(/-/g, '').substring(0, 16)
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
  const res = await retryWithJitter(() => fetchWithTimeout(url, withHeaders(opts)), { retries: 2, baseMs: 200 })
  if (!res.ok) throw new Error(`http_${res.status}`)
  return res
}

export async function httpJson(service, path, opts = {}) {
  const res = await httpRequest(service, path, opts)
  return res.json()
}

