import { listBooks } from '../services/inventory.js'
import { getTrending } from '../services/recommendations.js'
import { addToCart, removeFromCart, isInCart, getCart } from '../store/cart.js'
import { navigateTo } from '../router.js'

export function renderCatalog(rootEl) {
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
      // Load multiple pages to get all books
      let allData = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const data = await listBooks(page, 50) // Load 50 per page
        allData = allData.concat(data.books || [])
        hasMore = data.pagination && page < data.pagination.pages
        page++
      }
      
      allBooks = allData
      filteredBooks = allBooks
      displayedBooks = []
      currentBatch = 0
      loadMoreBooks()
      updateDisplay()
      bind()
    } catch (error) {
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
      updateCartButton()
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

    // Load more on scroll
    const scrollContainer = rootEl.querySelector('.scroll-container')
    if (scrollContainer) {
      scrollContainer.onscroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          if (displayedBooks.length < filteredBooks.length) {
            loadMoreBooks()
            updateDisplay()
          }
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
    const recsSection = rootEl.querySelector('#recommendations-section')
    const recsBtn = rootEl.querySelector('#recommendations-btn')
    
    if (recsSection.style.display === 'none') {
      // Show recommendations
      recsSection.style.display = 'block'
      recsBtn.textContent = '❌ Hide Trending'
      
      // Load trending books
      const trendingContainer = rootEl.querySelector('#trending-books')
      trendingContainer.innerHTML = '<div class="loading">Loading trending books...</div>'
      
      try {
        // Show 3 curated book recommendations
        let trendingBooks = []
        try {
          const trendingData = await getTrending(3)
          trendingBooks = trendingData.recommendations || []
        } catch (e) {
          // Fallback: show 3 curated recommendations
          const curatedRecommendations = [
            { title: "The Lord of the Rings", reason: "Epic fantasy adventure" },
            { title: "1984", reason: "Dystopian masterpiece" },
            { title: "The Martian", reason: "Sci-fi survival thriller" }
          ]
          
          trendingBooks = curatedRecommendations
            .map(rec => {
              const book = allBooks.find(b => b.title === rec.title)
              return book ? {
                id: book.id,
                title: book.title,
                coverImageUrl: book.cover_image_url,
                rating: book.rating || 4.5,
                reason: rec.reason,
                price: book.price,
                authors: book.authors
              } : null
            })
            .filter(Boolean)
            .slice(0, 3)
        }
        
        if (trendingBooks.length > 0) {
          trendingContainer.innerHTML = trendingBooks.map(book => trendingCard(book)).join('')
          bindTrendingCards()
        } else {
          trendingContainer.innerHTML = '<p class="muted">No trending books available at the moment.</p>'
        }
      } catch (e) {
        trendingContainer.innerHTML = '<p class="muted">Unable to load trending books.</p>'
      }
    } else {
      // Hide recommendations
      recsSection.style.display = 'none'
      recsBtn.textContent = '✨ Trending'
    }
  }

  const bindTrendingCards = () => {
    rootEl.querySelectorAll('.trending-card').forEach(card => {
      const bookId = card.getAttribute('data-book-id')
      card.onclick = () => navigateTo(`/book/${bookId}`)
    })
    
    rootEl.querySelectorAll('[data-trending-add]').forEach(btn => {
      const bookId = btn.getAttribute('data-trending-add')
      const price = Number(btn.getAttribute('data-price') || '0')
      
      btn.onclick = (e) => {
        e.stopPropagation()
        
        if (isInCart(bookId)) {
          removeFromCart(bookId)
          btn.textContent = 'Add'
          btn.classList.remove('remove')
        } else {
          addToCart(bookId, 1, price)
          btn.textContent = 'Remove'
          btn.classList.add('remove')
        }
        
        updateCartCount()
      }
    })
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
        <button id="recommendations-btn" class="nav-btn">Recommendations</button>
        <button id="cart-btn" class="nav-btn cart-btn">Cart</button>
      </div>
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
    
    <div id="recommendations-section" style="display: none; margin: 16px 0;">
      <div class="card">
        <h3 style="margin: 0 0 16px 0; color: var(--brand);">📖 Recommended for You</h3>
        <p style="margin: 0 0 16px 0; color: var(--muted);">3 books we think you'll love</p>
        <div id="trending-books" class="grid cols-auto"></div>
      </div>
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
    <img class="cover" src="${book.cover_image_url}" alt="${escapeHtml(book.title)}" loading="lazy"/>
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

function trendingCard(book) {
  const price = Number(book.price || 0)
  const rating = book.rating || 0
  
  return `
  <article class="card trending-card clickable" data-book-id="${book.id}" style="position: relative;">
    <div style="position: absolute; top: 8px; right: 8px; background: var(--brand); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">✨ Recommended</div>
    <img class="cover" src="${book.coverImageUrl || book.cover_image_url}" alt="${escapeHtml(book.title)}" loading="lazy"/>
    <h4 style="margin:8px 0 4px; font-size: 14px;">${escapeHtml(book.title)}</h4>
    <p class="muted" style="margin:0 0 4px; font-size: 12px;">${book.authors?.join(', ') || 'Unknown Author'}</p>
    ${book.reason ? `<p style="margin:0 0 8px; font-size: 12px; color: var(--accent); font-style: italic;">${book.reason}</p>` : ''}
    ${renderRating(rating)}
    <div class="price" style="font-size: 16px;">$${price.toFixed(2)}</div>
    <div class="row" style="justify-content:center; margin-top: 8px;">
      <button class="btn" data-trending-add="${book.id}" data-price="${price}" onclick="event.stopPropagation()" style="padding: 6px 12px; font-size: 14px;">Add</button>
    </div>
  </article>
  `
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
}


