/**
 * BookVerse Web Application - Inventory Service Integration
 *
 * This module provides comprehensive integration with the BookVerse Inventory Service,
 * implementing product catalog access, inventory management, and book discovery
 * functionality for the e-commerce frontend with sophisticated caching and error handling.
 *
 * 🏗️ Architecture Overview:
 *     - Product Catalog: Complete book catalog browsing and search functionality
 *     - Inventory Management: Real-time stock level checking and availability tracking
 *     - Pagination Support: Efficient large catalog browsing with configurable page sizes
 *     - URL Encoding: Secure parameter handling for special characters and IDs
 *     - Error Resilience: Comprehensive error handling with graceful degradation
 *
 * 🚀 Key Features:
 *     - Paginated book catalog browsing with configurable page sizes
 *     - Individual book detail retrieval with comprehensive metadata
 *     - Real-time inventory level checking and low stock filtering
 *     - URL-safe parameter encoding for secure API communication
 *     - Consistent error handling and retry logic via HTTP service layer
 *     - Performance optimization through efficient API design
 *
 * 🔧 Technical Implementation:
 *     - RESTful API integration with standardized endpoints
 *     - Query parameter building with URLSearchParams for safety
 *     - JSON response parsing with automatic error handling
 *     - UTF-8 safe URL encoding for international book titles and IDs
 *     - HTTP layer abstraction for request resilience and tracing
 *
 * 📊 Business Logic:
 *     - E-commerce product catalog management for book discovery
 *     - Inventory tracking for accurate stock availability display
 *     - Search and browsing optimization for user experience
 *     - Low stock alerts and inventory management support
 *     - Performance optimization for responsive catalog browsing
 *
 * 🛠️ Usage Patterns:
 *     - Catalog page rendering with pagination and search
 *     - Product detail page data loading and display
 *     - Inventory status checking for availability indicators
 *     - Admin inventory management and stock level monitoring
 *     - Search result display and filtering functionality
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

import { httpJson } from './http.js'

/**
 * Retrieve a paginated list of books from the inventory catalog.
 * 
 * This function provides access to the complete BookVerse book catalog with
 * pagination support for efficient browsing of large inventories. It's the
 * primary interface for catalog page rendering and book discovery workflows.
 * 
 * 🎯 Purpose:
 *     - Enable catalog page rendering with pagination support
 *     - Support book discovery and browsing workflows
 *     - Provide configurable page sizes for different UI contexts
 *     - Enable search result display and catalog navigation
 *     - Support admin inventory management interfaces
 * 
 * 🔧 API Integration:
 *     - Connects to GET /api/v1/books endpoint
 *     - Implements pagination with page and per_page parameters
 *     - Returns structured response with books array and pagination metadata
 *     - Handles URL parameter encoding for safe API communication
 *     - Leverages HTTP service layer for retry logic and error handling
 * 
 * 📊 Response Structure:
 *     The API returns a structured response containing:
 *     - books: Array of book objects with complete metadata
 *     - pagination: Metadata including total pages, current page, and totals
 *     - filters: Available filter options for enhanced browsing
 * 
 * @param {number} [page=1] - Page number to retrieve (1-based indexing)
 * @param {number} [perPage=10] - Number of books per page (1-100 range)
 * @returns {Promise<Object>} Promise resolving to paginated books response
 * @returns {Array} returns.books - Array of book objects with metadata
 * @returns {Object} returns.pagination - Pagination metadata and navigation info
 * 
 * @throws {Error} HTTP errors from inventory service or network issues
 * 
 * @example
 * // Basic catalog loading for first page
 * const catalogData = await listBooks();
 * console.log(`Loaded ${catalogData.books.length} books`);
 * 
 * @example
 * // Load specific page with custom page size
 * const page2Data = await listBooks(2, 20);
 * page2Data.books.forEach(book => {
 *   console.log(`${book.title} by ${book.authors.join(', ')}`);
 * });
 * 
 * @example
 * // Handle pagination for large catalogs
 * let currentPage = 1;
 * let hasMorePages = true;
 * 
 * while (hasMorePages) {
 *   const data = await listBooks(currentPage, 50);
 *   processBooks(data.books);
 *   
 *   hasMorePages = currentPage < data.pagination.pages;
 *   currentPage++;
 * }
 * 
 * @example
 * // Error handling for network issues
 * try {
 *   const books = await listBooks(1, 25);
 *   renderCatalog(books);
 * } catch (error) {
 *   console.error('Failed to load catalog:', error.message);
 *   showErrorMessage('Unable to load books. Please try again.');
 * }
 * 
 * @since 1.0.0
 */
export async function listBooks(page = 1, perPage = 10) {
  return httpJson('inventory', `/api/v1/books?page=${page}&per_page=${perPage}`)
}

/**
 * Retrieve detailed information for a specific book by ID.
 * 
 * This function fetches comprehensive metadata for an individual book,
 * providing all information needed for product detail pages, recommendations,
 * and cart operations. It handles URL encoding for safe ID transmission.
 * 
 * 🎯 Purpose:
 *     - Enable product detail page rendering with complete book information
 *     - Support shopping cart operations with accurate product data
 *     - Provide data for recommendation algorithms and related products
 *     - Enable admin product management and editing workflows
 *     - Support search result detail display and book previews
 * 
 * 🔧 API Integration:
 *     - Connects to GET /api/v1/books/{bookId} endpoint
 *     - Implements URL encoding for safe ID transmission
 *     - Returns complete book object with all metadata fields
 *     - Handles special characters in book IDs and international titles
 *     - Leverages HTTP service layer for comprehensive error handling
 * 
 * 📊 Book Object Structure:
 *     The returned book object includes:
 *     - id: Unique book identifier
 *     - title, subtitle: Book title information
 *     - authors: Array of author names
 *     - genres: Array of genre classifications
 *     - description: Full book description
 *     - price: Current pricing information
 *     - rating: Average customer rating
 *     - cover_image_url: Book cover image URL
 *     - metadata: Additional book information
 * 
 * @param {string} bookId - Unique identifier for the book to retrieve
 * @returns {Promise<Object>} Promise resolving to complete book object
 * @returns {string} returns.id - Unique book identifier
 * @returns {string} returns.title - Book title
 * @returns {Array<string>} returns.authors - Array of author names
 * @returns {Array<string>} returns.genres - Array of genre classifications
 * @returns {string} returns.description - Full book description
 * @returns {number} returns.price - Current book price
 * @returns {number} returns.rating - Average customer rating (0-5)
 * @returns {string} returns.cover_image_url - URL to book cover image
 * 
 * @throws {Error} HTTP 404 if book not found, other HTTP errors, or network issues
 * 
 * @example
 * // Basic book detail loading
 * const book = await getBook('book-uuid-123');
 * console.log(`${book.title} costs $${book.price}`);
 * 
 * @example
 * // Load book for product detail page
 * const bookId = getBookIdFromUrl();
 * try {
 *   const book = await getBook(bookId);
 *   renderProductPage(book);
 *   updatePageTitle(book.title);
 * } catch (error) {
 *   if (error.message === 'http_404') {
 *     showNotFoundPage();
 *   } else {
 *     showErrorPage('Unable to load book details');
 *   }
 * }
 * 
 * @example
 * // Handle special characters in book IDs
 * const bookWithSpecialId = await getBook('book-with-special-chars!@#');
 * // URL encoding is handled automatically
 * 
 * @example
 * // Use book data for cart operations
 * const book = await getBook(selectedBookId);
 * addToCart({
 *   id: book.id,
 *   title: book.title,
 *   price: book.price,
 *   authors: book.authors
 * });
 * 
 * @since 1.0.0
 */
export async function getBook(bookId) {
  return httpJson('inventory', `/api/v1/books/${encodeURIComponent(bookId)}`)
}

/**
 * Retrieve paginated inventory information with optional low stock filtering.
 * 
 * This function provides access to detailed inventory data including stock levels,
 * availability status, and warehouse information. It supports filtering for low
 * stock items to enable proactive inventory management and restocking workflows.
 * 
 * 🎯 Purpose:
 *     - Enable admin inventory management and monitoring workflows
 *     - Support low stock alerts and restocking notifications
 *     - Provide data for inventory reports and analytics
 *     - Enable stock level display and availability indicators
 *     - Support warehouse management and distribution planning
 * 
 * 🔧 API Integration:
 *     - Connects to GET /api/v1/inventory endpoint
 *     - Implements pagination with configurable page sizes
 *     - Supports low_stock filtering for proactive management
 *     - Uses URLSearchParams for safe query parameter construction
 *     - Leverages HTTP service layer for retry logic and error handling
 * 
 * 📊 Inventory Object Structure:
 *     Each inventory item includes:
 *     - book_id: Reference to associated book
 *     - quantity_available: Current stock level
 *     - quantity_reserved: Reserved inventory (pending orders)
 *     - reorder_point: Threshold for restocking alerts
 *     - warehouse_location: Physical location information
 *     - last_updated: Timestamp of last inventory update
 * 
 * @param {number} [page=1] - Page number to retrieve (1-based indexing)
 * @param {number} [perPage=10] - Number of inventory items per page
 * @param {boolean} [lowStock=false] - Filter for items below reorder point
 * @returns {Promise<Object>} Promise resolving to paginated inventory response
 * @returns {Array} returns.inventory - Array of inventory objects
 * @returns {Object} returns.pagination - Pagination metadata
 * @returns {Object} returns.summary - Inventory summary statistics
 * 
 * @throws {Error} HTTP errors from inventory service or network issues
 * 
 * @example
 * // Basic inventory listing for admin dashboard
 * const inventory = await listInventory();
 * console.log(`Managing ${inventory.inventory.length} inventory items`);
 * 
 * @example
 * // Load low stock items for restocking alerts
 * const lowStockItems = await listInventory(1, 50, true);
 * if (lowStockItems.inventory.length > 0) {
 *   showRestockingAlert(lowStockItems.inventory);
 * }
 * 
 * @example
 * // Paginate through entire inventory for reporting
 * let currentPage = 1;
 * const allInventory = [];
 * 
 * while (true) {
 *   const data = await listInventory(currentPage, 100);
 *   allInventory.push(...data.inventory);
 *   
 *   if (currentPage >= data.pagination.pages) break;
 *   currentPage++;
 * }
 * 
 * generateInventoryReport(allInventory);
 * 
 * @example
 * // Monitor inventory levels for specific books
 * const inventory = await listInventory(1, 100);
 * const criticalItems = inventory.inventory.filter(item => 
 *   item.quantity_available < item.reorder_point
 * );
 * 
 * if (criticalItems.length > 0) {
 *   sendRestockingNotification(criticalItems);
 * }
 * 
 * @since 1.0.0
 */
export async function listInventory(page = 1, perPage = 10, lowStock = false) {
  // 🔧 Query Parameter Construction: Build safe URL parameters
  const qs = new URLSearchParams({ 
    page: String(page), 
    per_page: String(perPage) 
  })
  
  // 📊 Low Stock Filtering: Add filter for inventory management
  if (lowStock) qs.set('low_stock', 'true')
  
  return httpJson('inventory', `/api/v1/inventory?${qs.toString()}`)
}

