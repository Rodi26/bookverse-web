import { listBooks } from '../services/inventory.js'
import { getTrending } from '../services/recommendations.js'
import { addToCart, removeFromCart, isInCart, getCart } from '../store/cart.js'
import { navigateTo } from '../router.js'
import { resolveImageUrl } from '../util/imageUrl.js'
import { renderAuthStatus } from './auth.js'

import authService from '../services/auth.js'

export function renderCatalog(rootEl) {
  // Check authentication status
  if (!authService.isAuthenticated()) {
    rootEl.innerHTML = `
      <div class="auth-required">
        <div class="auth-card">
          <h2>Authentication Required</h2>
          <p>Please sign in to access the BookVerse catalog.</p>
          <button id="auth-login-redirect-btn" class="login-button">Sign In</button>
        </div>
      </div>
    `
    
    // Add click handler for sign in button
    document.getElementById('auth-login-redirect-btn')?.addEventListener('click', () => {
      navigateTo('/login')
    })
    return
  }
  
  rootEl.innerHTML = layout('Loading...')
  let allBooks = []
  let filteredBooks = []
  let displayedBooks = []
  let currentBatch = 0
  const batchSize = 15
  const state = { query: '' }

  // Load all books at once
  const loadAllBooks = async () => {
    try {
      // Debug: Starting book loading
      
      // Load multiple pages to get all books
      let allData = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        // Debug: Loading page ${page}
        const data = await listBooks(page, 50) // Load 50 per page
        // Debug: Page ${page} loaded: ${data.books?.length} books
        
        allData = allData.concat(data.books || [])
        hasMore = data.pagination && page < data.pagination.pages
        page++
      }
      
      // Debug: All books loaded: ${allData.length} total books
      
      allBooks = allData
      filteredBooks = allBooks
      displayedBooks = []
      currentBatch = 0
      loadMoreBooks()
      updateDisplay()
      bind()
    } catch (error) {
      console.error('❌ CATALOG: Book loading failed:', error);
      console.error('❌ CATALOG: Error details:', error.message, error.stack);
      rootEl.innerHTML = layout('Error loading books. Please try again.')
    }
  }

  const loadMoreBooks = () => {
    const start = currentBatch * batchSize
    const end = start + batchSize
    const newBooks = filteredBooks.slice(start, end)
    displayedBooks = displayedBooks.concat(newBooks)
    currentBatch++
  }

  const updateDisplay = () => {
    const cards = displayedBooks.map(it => card(it)).join('')
    const hasMore = displayedBooks.length < filteredBooks.length
    rootEl.innerHTML = layout(cards, hasMore)
    bind()
  }

  const performSearch = () => {
    const query = state.query.toLowerCase()
    if (!query) {
      filteredBooks = allBooks
    } else {
      filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.authors.some(author => author.toLowerCase().includes(query)) ||
        book.genres.some(genre => genre.toLowerCase().includes(query))
      )
    }
    displayedBooks = []
    currentBatch = 0
    loadMoreBooks()
    updateDisplay()
  }

  const bind = () => {
    // Navigation buttons
    const cartBtn = rootEl.querySelector('#cart-btn')
    if (cartBtn) {
      cartBtn.onclick = () => navigateTo('/cart')
      updateCartCount()
    }

    const homeBtn = rootEl.querySelector('#home-btn')
    if (homeBtn) {
      homeBtn.onclick = () => navigateTo('/')
    }

    // Search functionality
    const searchBtn = rootEl.querySelector('#search-btn')
    const searchInput = rootEl.querySelector('#search-input')
    if (searchBtn && searchInput) {
      searchBtn.onclick = () => {
        state.query = searchInput.value.trim()
        performSearch()
      }
      searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          state.query = searchInput.value.trim()
          performSearch()
        }
      }
      // Clear search on input change if empty
      searchInput.oninput = (e) => {
        const clearBtn = rootEl.querySelector('#clear-search-btn')
        if (!e.target.value.trim()) {
          state.query = ''
          if (clearBtn) clearBtn.style.display = 'none'
          performSearch()
        } else {
          if (clearBtn) clearBtn.style.display = 'inline-block'
        }
      }
    }

    // Clear search button
    const clearSearchBtn = rootEl.querySelector('#clear-search-btn')
    if (clearSearchBtn) {
      clearSearchBtn.onclick = () => {
        if (searchInput) searchInput.value = ''
        state.query = ''
        clearSearchBtn.style.display = 'none'
        performSearch()
      }
    }

    // Recommendations/Trending button
    const recsBtn = rootEl.querySelector('#recommendations-btn')
    if (recsBtn) {
      recsBtn.onclick = () => toggleRecommendations()
    }

    // Load more on scroll (using window scroll instead of container scroll)
    window.onscroll = () => {
      const { scrollY, scrollHeight, innerHeight } = window
      if (scrollY + innerHeight >= document.body.scrollHeight - 100) {
        if (displayedBooks.length < filteredBooks.length) {
          loadMoreBooks()
          updateDisplay()
        }
      }
    }

    // Book card clicks (make entire card clickable except buttons)
    rootEl.querySelectorAll('.book-card').forEach(card => {
      const bookId = card.getAttribute('data-book-id')
      card.onclick = (e) => {
        // Don't navigate if clicking on buttons
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
          return
        }
        navigateTo(`/book/${bookId}`)
      }
    })

    // Add/Remove buttons
    rootEl.querySelectorAll('[data-add-id]').forEach(btn => {
      const id = btn.getAttribute('data-add-id')
      const price = Number(btn.getAttribute('data-price') || '0')
      
      btn.onclick = (e) => {
        e.stopPropagation() // Prevent card click
        
        if (isInCart(id)) {
          removeFromCart(id)
          btn.textContent = 'Add'
          btn.classList.remove('remove')
        } else {
          addToCart(id, 1, price)
          btn.textContent = 'Remove'
          btn.classList.add('remove')
        }
        
        // Update cart count
        updateCartCount()
      }
    })

    // Update button states
    updateButtonStates()
    updateCartCount()
  }

  const updateButtonStates = () => {
    rootEl.querySelectorAll('[data-add-id]').forEach(btn => {
      const id = btn.getAttribute('data-add-id')
      if (isInCart(id)) {
        btn.textContent = 'Remove'
        btn.classList.add('remove')
      } else {
        btn.textContent = 'Add'
        btn.classList.remove('remove')
      }
    })
  }

  const updateCartCount = () => {
    const cartBtn = rootEl.querySelector('#cart-btn')
    if (cartBtn) {
      const cart = getCart()
      const count = cart.items.length
      cartBtn.textContent = count > 0 ? `Cart (${count})` : 'Cart'
    }
  }

  const toggleRecommendations = async () => {
    const recsBtn = rootEl.querySelector('#recommendations-btn')
    
    // Check if currently showing trending
    if (recsBtn.textContent.includes('Show All')) {
      // Switch back to showing all books
      filteredBooks = allBooks
      recsBtn.textContent = '✨ Trending'
      displayedBooks = []
      currentBatch = 0
      loadMoreBooks()
      updateDisplay()
    } else {
      // Filter to show only trending books
      recsBtn.textContent = '📚 Show All Books'
      
      try {
        // Get trending book titles
        let trendingTitles = []
        try {
          const trendingData = await getTrending(3)
          trendingTitles = (trendingData.recommendations || []).map(r => r.title)
        } catch (e) {
          // Fallback: use curated trending titles
          trendingTitles = ["The Lord of the Rings", "1984", "The Martian"]
        }
        
        // Filter main catalog to only show trending books
        filteredBooks = allBooks.filter(book => 
          trendingTitles.includes(book.title)
        ).slice(0, 3) // Ensure we only show 3 books max
        
        displayedBooks = []
        currentBatch = 0
        loadMoreBooks()
        updateDisplay()
        
      } catch (e) {
        console.error('Error loading trending books:', e)
        // Fallback to top-rated books
        filteredBooks = allBooks
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3)
        
        displayedBooks = []
        currentBatch = 0
        loadMoreBooks()
        updateDisplay()
      }
    }
  }


  loadAllBooks()
}

function layout(content, hasMore = false) {
  return `
  <main class="container">
    <nav class="global-nav">
      <div class="nav-brand">📚 BookVerse</div>
      <div class="nav-links">
        <button id="home-btn" class="nav-btn">Home</button>
        <button id="recommendations-btn" class="nav-btn">✨ Trending</button>
        <button id="cart-btn" class="nav-btn cart-btn">Cart</button>
      </div>
      ${renderAuthStatus()}
    </nav>
    
    <div class="banner">
      <h1>Discover your next favorite book</h1>
      <p>From our curated collection of 45 amazing titles</p>
    </div>
    
    <div class="search-container">
      <input id="search-input" class="search-input" placeholder="Search books, authors, or genres..." />
      <button id="search-btn" class="search-btn">Search</button>
      <button id="clear-search-btn" class="btn secondary" style="margin-left: 8px; display: none;">Clear</button>
    </div>
    
    
    <div class="scroll-container">
      <div class="grid cols-auto">
        ${content}
      </div>
      ${hasMore ? '<div class="loading" style="text-align: center; padding: 20px; color: var(--muted);">Scroll for more books...</div>' : ''}
    </div>
  </main>
  `
}

function renderRating(rating) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  let stars = ''
  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star">★</span>'
  }
  if (hasHalfStar) {
    stars += '<span class="star">☆</span>'
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star empty">☆</span>'
  }
  
  return `<div class="rating">${stars} <span class="muted">(${rating})</span></div>`
}

function card(book) {
  const price = Number(book.price)
  const rating = book.rating || 0
  
  return `
  <article class="card book-card clickable" data-book-id="${book.id}">
    <img class="cover" src="${resolveImageUrl(book.cover_image_url, window.__BOOKVERSE_CONFIG__.inventoryBaseUrl)}" alt="${escapeHtml(book.title)}" loading="lazy"/>
    <h3 style="margin:8px 0 4px;">${escapeHtml(book.title)}</h3>
    <p class="muted" style="margin:0 0 4px;">${book.authors.join(', ')}</p>
    ${renderRating(rating)}
    <div class="price">$${price.toFixed(2)}</div>
    <div class="row" style="justify-content:center; margin-top: 12px;">
      <button class="btn" data-add-id="${book.id}" data-price="${price}" onclick="event.stopPropagation()">Add</button>
    </div>
  </article>
  `
}


function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
}


