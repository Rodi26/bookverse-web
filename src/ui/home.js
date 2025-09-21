export function renderHome(rootEl) {
  const cfg = window.__BOOKVERSE_CONFIG__ || { env: 'DEV' }
  rootEl.innerHTML = `
    <main class="container">
      <header class="row" style="justify-content:space-between;">
        <h1 style="margin:0;">BookVerse Web</h1>
        <nav class="nav">
          <a href="#/">Home</a>
          <a href="#/catalog">Catalog</a>
          <a href="#/cart">Cart</a>
        </nav>
      </header>
      <p>Environment: <strong>${cfg.env}</strong></p>
      <div class="space"></div>
      <section class="card">
        <h3>Services</h3>
        <ul class="muted">
          <li>Inventory: ${cfg.inventoryBaseUrl || 'n/a'}</li>
          <li>Recommendations: ${cfg.recommendationsBaseUrl || 'n/a'}</li>
          <li>Checkout: ${cfg.checkoutBaseUrl || 'n/a'}</li>
        </ul>
      </section>
    </main>
  `
}

