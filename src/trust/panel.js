export async function attachTrustPanel() {
  const btn = document.createElement('button')
  btn.textContent = 'Release Info'
  btn.style.cssText = `
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 1000;
    background: var(--panel);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  `
  btn.onmouseenter = () => btn.style.transform = 'translateY(-2px)'
  btn.onmouseleave = () => btn.style.transform = 'translateY(0)'
  document.body.appendChild(btn)

  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `
  modal.innerHTML = `<div style="background: var(--panel); border: 1px solid var(--border); padding: 24px; border-radius: 12px; min-width: 400px; max-width: 80vw; color: var(--text);">
    <h3 style="margin: 0 0 16px 0; color: var(--brand);">📊 BookVerse Release Information</h3>
    <div id="trust-content" style="font-family: ui-monospace, monospace; font-size: 14px; line-height: 1.5;">Loading...</div>
    <div style="text-align: right; margin-top: 20px;">
      <button id="trust-close" style="background: var(--brand); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
    </div>
  </div>`
  document.body.appendChild(modal)

  btn.onclick = async () => {
    modal.style.display = 'flex'
    const content = modal.querySelector('#trust-content')
    try {
      // Try to fetch evidence first, fallback to showing current app info
      try {
        const res = await fetch('/.well-known/apptrust/evidence.json')
        if (res.ok) {
          const data = await res.json()
          content.innerHTML = renderEvidence(data)
          return
        }
      } catch {
        // Fallback to showing app info
      }

      // Show current application information
      content.innerHTML = renderAppInfo()
    } catch {
      content.textContent = 'Error loading release information.'
    }
  }
  modal.querySelector('#trust-close').onclick = () => modal.style.display = 'none'
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none'
  }
}

function renderEvidence(data) {
  const version = data?.version || 'n/a'
  const images = (data?.images || []).map(i => `<li style="margin: 4px 0;"><code style="background: var(--bg); padding: 2px 6px; border-radius: 4px;">${i.name}</code> — <small style="color: var(--muted);">${i.digest?.substring(0, 12) || 'no digest'}...</small></li>`).join('')
  return `
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Version:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">${version}</code></p>
      <p style="margin: 8px 0;"><strong style="color: var(--brand);">Container Images:</strong></p>
      <ul style="margin: 8px 0; padding-left: 20px;">${images || '<li style="color: var(--muted);">No images available</li>'}</ul>
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Runtime Info:</strong></p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">User Agent: ${navigator.userAgent.substring(0, 60)}...</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `
}

function renderAppInfo() {
  const config = window.__BOOKVERSE_CONFIG__ || {}
  const services = [
    { name: 'Inventory', url: config.inventoryBaseUrl || 'Not configured', status: config.inventoryBaseUrl ? '🟢' : '🔴' },
    { name: 'Recommendations', url: config.recommendationsBaseUrl || 'Not configured', status: config.recommendationsBaseUrl ? '🟢' : '🔴' },
    { name: 'Checkout', url: config.checkoutBaseUrl || 'Not configured', status: config.checkoutBaseUrl ? '🟢' : '🔴' }
  ]

  return `
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Application:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">BookVerse Web</code></p>
      <p style="margin: 8px 0 0 0;"><strong style="color: var(--brand);">Environment:</strong> <code style="background: var(--panel); padding: 2px 6px; border-radius: 4px;">${config.env || 'DEV'}</code></p>
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p style="margin: 0 0 12px 0;"><strong style="color: var(--brand);">Service Endpoints:</strong></p>
      ${services.map(service => `
        <div style="margin: 8px 0; padding: 8px; background: var(--panel); border-radius: 6px; border-left: 3px solid ${service.status === '🟢' ? 'var(--brand-success)' : 'var(--brand-danger)'};">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px;">${service.status}</span>
            <strong>${service.name}</strong>
          </div>
          <div style="font-size: 12px; color: var(--muted); margin-top: 4px; font-family: ui-monospace, monospace;">${service.url}</div>
        </div>
      `).join('')}
    </div>
    <div style="background: var(--bg); padding: 16px; border-radius: 8px;">
      <p style="margin: 0 0 8px 0;"><strong style="color: var(--brand);">Runtime Info:</strong></p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Browser: ${navigator.userAgent.split(' ').pop()}</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Timestamp: ${new Date().toISOString()}</p>
      <p style="margin: 4px 0; font-size: 12px; color: var(--muted);">Location: ${window.location.href}</p>
    </div>
  `
}

