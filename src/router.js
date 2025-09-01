const routes = []

export function initRouter(rootEl, map) {
  // map: { '/': fn, '/book/:id': fn }
  for (const [pattern, handler] of Object.entries(map)) {
    routes.push({ ...compile(pattern), handler })
  }
  window.addEventListener('hashchange', () => renderRoute(rootEl))
  renderRoute(rootEl)
}

export function navigateTo(path) {
  if (location.hash !== `#${path}`) location.hash = `#${path}`
}

function parseHash() {
  return location.hash.replace(/^#/, '') || '/'
}

function renderRoute(rootEl) {
  const path = parseHash()
  for (const r of routes) {
    const params = r.match(path)
    if (params) {
      return r.handler(rootEl, params)
    }
  }
  rootEl.innerHTML = `<main style="padding:24px;"><h1>Not Found</h1><p>${path}</p></main>`
}

function compile(pattern) {
  const parts = pattern.split('/').filter(Boolean)
  const keys = []
  const regexParts = parts.map(p => {
    if (p.startsWith(':')) { keys.push(p.slice(1)); return '([^/]+)' }
    return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  const regex = new RegExp('^/' + regexParts.join('/') + '$')
  return {
    pattern,
    match: (path) => {
      const m = path.match(regex)
      if (!m) return null
      const params = {}
      keys.forEach((k, i) => params[k] = decodeURIComponent(m[i + 1]))
      return params
    }
  }
}


