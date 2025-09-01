export async function attachTrustPanel() {
  const btn = document.createElement('button')
  btn.textContent = 'Release Info'
  btn.style.position = 'fixed'
  btn.style.right = '16px'
  btn.style.bottom = '16px'
  btn.style.zIndex = '1000'
  document.body.appendChild(btn)

  const modal = document.createElement('div')
  modal.style.position = 'fixed'
  modal.style.inset = '0'
  modal.style.background = 'rgba(0,0,0,0.4)'
  modal.style.display = 'none'
  modal.style.alignItems = 'center'
  modal.style.justifyContent = 'center'
  modal.innerHTML = `<div style="background:#fff; padding:16px; border-radius:8px; min-width:360px; max-width:80vw;">
    <h3>Release Information</h3>
    <div id="trust-content" style="font-family: ui-sans-serif, system-ui; font-size:14px; color:#333;">Loading...</div>
    <div style="text-align:right; margin-top:12px;"><button id="trust-close">Close</button></div>
  </div>`
  document.body.appendChild(modal)

  btn.onclick = async () => {
    modal.style.display = 'flex'
    const content = modal.querySelector('#trust-content')
    try {
      const res = await fetch('/.well-known/apptrust/evidence.json')
      if (!res.ok) throw new Error('not_found')
      const data = await res.json()
      content.innerHTML = renderEvidence(data)
    } catch {
      content.textContent = 'Evidence manifest not available.'
    }
  }
  modal.querySelector('#trust-close').onclick = () => modal.style.display = 'none'
}

function renderEvidence(data) {
  const version = data?.version || 'n/a'
  const images = (data?.images || []).map(i => `<li><code>${i.name}</code> — <small>${i.digest || ''}</small></li>`).join('')
  return `
    <p><strong>Version:</strong> ${version}</p>
    <p><strong>Images:</strong></p>
    <ul>${images || '<li>n/a</li>'}</ul>
  `
}


