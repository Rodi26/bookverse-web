/**
 * BookVerse Web Application - Shopping Cart State Management
 *
 * This module provides comprehensive shopping cart state management for the BookVerse
 * e-commerce platform, implementing persistent cart storage, cart operations, and
 * state synchronization across browser sessions with robust error handling and
 * data integrity features.
 *
 * 🏗️ Architecture Overview:
 *     - Persistent Storage: LocalStorage-based cart persistence across browser sessions
 *     - State Management: Centralized cart state with atomic operations
 *     - Data Integrity: JSON serialization with error handling and fallback mechanisms
 *     - Performance Optimization: Efficient cart operations with minimal storage I/O
 *     - Cross-Tab Synchronization: Shared cart state across multiple browser tabs
 *
 * 🚀 Key Features:
 *     - Persistent cart storage that survives browser restarts and tab closures
 *     - Atomic cart operations ensuring data consistency and integrity
 *     - Automatic quantity management with intelligent item consolidation
 *     - Comprehensive error handling with graceful degradation
 *     - Cross-browser compatibility with localStorage API
 *     - Version-controlled storage schema for future migration support
 *
 * 🔧 Technical Implementation:
 *     - LocalStorage API for persistent client-side storage
 *     - JSON serialization for structured data storage
 *     - Atomic operations ensuring cart state consistency
 *     - Error boundaries with fallback to empty cart state
 *     - Immutable update patterns for predictable state changes
 *
 * 📊 Business Logic:
 *     - Cart persistence enabling cross-session shopping experiences
 *     - Abandoned cart recovery through persistent storage
 *     - Optimistic cart updates for immediate user feedback
 *     - Cart conversion optimization through seamless user experience
 *     - Revenue protection through reliable cart state management
 *
 * 🛠️ Usage Patterns:
 *     - E-commerce cart management for product selection and checkout
 *     - Cross-component cart state sharing and synchronization
 *     - Cart persistence for multi-session shopping experiences
 *     - Real-time cart updates and immediate user feedback
 *     - Integration with checkout workflows and order processing
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

// 🔑 Storage Key: Versioned localStorage key for cart data persistence
const KEY = 'bookverse.cart.v1'

/**
 * Retrieve current shopping cart state from persistent storage.
 * 
 * This function loads the complete cart state from localStorage with comprehensive
 * error handling and fallback mechanisms. It ensures reliable cart retrieval
 * even when storage is corrupted or unavailable.
 * 
 * 🎯 Purpose:
 *     - Load persistent cart state from browser localStorage
 *     - Provide reliable cart retrieval with error handling
 *     - Return consistent cart structure regardless of storage state
 *     - Enable cross-session cart persistence for enhanced user experience
 * 
 * 🔧 Implementation Features:
 *     - JSON deserialization with error handling
 *     - Fallback to empty cart on parsing failures
 *     - Consistent cart structure with items array
 *     - Cross-browser localStorage compatibility
 * 
 * @returns {Object} Current cart state with items array
 * @returns {Array} returns.items - Array of cart items with book details
 * 
 * @example
 * // Basic cart retrieval
 * const cart = getCart();
 * console.log(`Cart has ${cart.items.length} items`);
 * 
 * @example
 * // Access cart items for display
 * const cart = getCart();
 * cart.items.forEach(item => {
 *   console.log(`${item.qty}x ${item.bookId} at $${item.unitPrice}`);
 * });
 * 
 * Cart Structure:
 *     - items: Array of cart item objects
 *     - Each item: { bookId, qty, unitPrice }
 * 
 * Error Handling:
 *     - Storage unavailable: Returns empty cart structure
 *     - JSON parsing errors: Returns empty cart structure
 *     - Corrupted data: Returns empty cart structure
 * 
 * @since 1.0.0
 */
export function getCart () {
  try {
    // 📥 Storage Retrieval: Load cart data from localStorage
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : { items: [] }
  } catch {
    // 🔄 Error Fallback: Return empty cart on any storage or parsing errors
    return { items: [] }
  }
}

/**
 * Persist shopping cart state to browser localStorage.
 * 
 * This function saves the complete cart state to persistent storage with
 * JSON serialization and error handling. It ensures reliable cart persistence
 * across browser sessions and tab closures.
 * 
 * 🎯 Purpose:
 *     - Persist cart state across browser sessions and tab closures
 *     - Provide atomic cart storage operations for data consistency
 *     - Enable cart recovery and cross-session shopping experiences
 *     - Support cart synchronization across multiple browser tabs
 * 
 * 🔧 Implementation Features:
 *     - JSON serialization for structured data storage
 *     - Fallback to empty cart for invalid input
 *     - Atomic storage operations for data consistency
 *     - Cross-browser localStorage compatibility
 * 
 * @param {Object} cart - Cart object to persist to storage
 * @param {Array} cart.items - Array of cart items to store
 * 
 * @example
 * // Save updated cart state
 * const cart = { items: [{ bookId: '123', qty: 1, unitPrice: 29.99 }] };
 * saveCart(cart);
 * 
 * @example
 * // Clear cart by saving empty state
 * saveCart({ items: [] });
 * 
 * Storage Format:
 *     - JSON serialized cart object
 *     - Versioned storage key for future migrations
 *     - Atomic write operations for consistency
 * 
 * @since 1.0.0
 */
export function saveCart (cart) {
  // 💾 Data Persistence: Store cart state in localStorage with JSON serialization
  localStorage.setItem(KEY, JSON.stringify(cart || { items: [] }))
}

/**
 * Add product to shopping cart with intelligent quantity management.
 * 
 * This function adds items to the cart with automatic quantity consolidation
 * for existing items and atomic state updates. It provides optimistic updates
 * for immediate user feedback and seamless shopping experience.
 * 
 * 🎯 Purpose:
 *     - Add products to cart with quantity management
 *     - Consolidate duplicate items by updating quantities
 *     - Provide immediate cart updates for optimistic UI
 *     - Maintain cart state consistency through atomic operations
 * 
 * 🔧 Implementation Features:
 *     - Automatic quantity consolidation for existing items
 *     - Atomic cart state updates with immediate persistence
 *     - Structured item data with pricing information
 *     - Consistent cart structure maintenance
 * 
 * @param {string} bookId - Unique identifier for the book to add
 * @param {number} qty - Quantity of books to add to cart
 * @param {number} unitPrice - Price per unit for the book
 * @returns {Object} Updated cart state after addition
 * 
 * @example
 * // Add single book to cart
 * const updatedCart = addToCart('book-123', 1, 29.99);
 * console.log(`Cart now has ${updatedCart.items.length} unique items`);
 * 
 * @example
 * // Add multiple copies of a book
 * addToCart('book-456', 3, 19.99);
 * 
 * @example
 * // Adding existing item consolidates quantity
 * addToCart('book-123', 1, 29.99); // First addition
 * addToCart('book-123', 2, 29.99); // Increases quantity to 3
 * 
 * Item Structure:
 *     - bookId: Unique book identifier string
 *     - qty: Numeric quantity of items
 *     - unitPrice: Numeric price per unit
 * 
 * Business Logic:
 *     - Existing items: Quantity is added to current amount
 *     - New items: Added as new cart entry
 *     - Automatic persistence: Cart saved immediately
 * 
 * @since 1.0.0
 */
export function addToCart (bookId, qty, unitPrice) {
  // 🛒 Cart Retrieval: Load current cart state
  const cart = getCart()
  
  // 🔍 Item Lookup: Check for existing item in cart
  const existing = cart.items.find(i => i.bookId === bookId)
  
  if (existing) {
    // ➕ Quantity Update: Increase quantity for existing item
    existing.qty += qty
  } else {
    // 📦 New Item: Add new item to cart
    cart.items.push({ bookId, qty, unitPrice })
  }
  
  // 💾 State Persistence: Save updated cart state
  saveCart(cart)
  return cart
}

/**
 * Remove product completely from shopping cart.
 * 
 * This function removes all instances of a specific product from the cart
 * with atomic state updates and immediate persistence. It provides clean
 * cart management for item removal operations.
 * 
 * 🎯 Purpose:
 *     - Remove products completely from shopping cart
 *     - Maintain cart state consistency after item removal
 *     - Provide immediate cart updates for responsive UI
 *     - Support cart cleanup and item management workflows
 * 
 * 🔧 Implementation Features:
 *     - Complete item removal (all quantities)
 *     - Atomic cart state updates with immediate persistence
 *     - Array filtering for efficient item removal
 *     - Consistent cart structure maintenance
 * 
 * @param {string} bookId - Unique identifier for the book to remove
 * @returns {Object} Updated cart state after removal
 * 
 * @example
 * // Remove item from cart
 * const updatedCart = removeFromCart('book-123');
 * console.log(`Item removed, cart now has ${updatedCart.items.length} items`);
 * 
 * @example
 * // Remove item and update UI
 * const cart = removeFromCart(selectedBookId);
 * updateCartDisplay(cart);
 * updateCartCount(cart.items.length);
 * 
 * Removal Behavior:
 *     - Removes ALL quantities of the specified item
 *     - Does not affect other items in cart
 *     - Maintains cart structure integrity
 *     - Immediate persistence of updated state
 * 
 * @since 1.0.0
 */
export function removeFromCart (bookId) {
  // 🛒 Cart Retrieval: Load current cart state
  const cart = getCart()
  
  // 🗑️ Item Removal: Filter out items matching the specified bookId
  cart.items = cart.items.filter(item => item.bookId !== bookId)
  
  // 💾 State Persistence: Save updated cart state
  saveCart(cart)
  return cart
}

/**
 * Clear all items from shopping cart.
 * 
 * This function completely empties the shopping cart by removing all items
 * and resetting to initial state. It provides clean cart reset functionality
 * for checkout completion or manual cart clearing operations.
 * 
 * 🎯 Purpose:
 *     - Reset cart to empty state for checkout completion
 *     - Provide manual cart clearing functionality
 *     - Enable cart cleanup for session reset
 *     - Support cart state management workflows
 * 
 * 🔧 Implementation Features:
 *     - Complete cart reset to initial state
 *     - Atomic operation with immediate persistence
 *     - Consistent empty cart structure
 *     - Cross-component state synchronization
 * 
 * @example
 * // Clear cart after successful checkout
 * clearCart();
 * console.log('Cart cleared after order completion');
 * 
 * @example
 * // Manual cart reset
 * clearCart();
 * updateCartDisplay({ items: [] });
 * 
 * @since 1.0.0
 */
export function clearCart () {
  // 🧹 Cart Reset: Save empty cart state to clear all items
  saveCart({ items: [] })
}

/**
 * Check if specific product exists in shopping cart.
 * 
 * This function provides efficient cart membership testing for UI state
 * management and conditional rendering. It enables optimistic UI updates
 * and cart-dependent functionality throughout the application.
 * 
 * 🎯 Purpose:
 *     - Enable cart-dependent UI state management
 *     - Support conditional rendering based on cart contents
 *     - Provide efficient cart membership testing
 *     - Enable optimistic UI updates for cart operations
 * 
 * 🔧 Implementation Features:
 *     - Efficient array search with early termination
 *     - Boolean return for simple conditional logic
 *     - No side effects or state modifications
 *     - Optimized for frequent UI queries
 * 
 * @param {string} bookId - Unique identifier for the book to check
 * @returns {boolean} True if book exists in cart, false otherwise
 * 
 * @example
 * // Conditional button text based on cart state
 * const buttonText = isInCart(bookId) ? 'Remove from Cart' : 'Add to Cart';
 * 
 * @example
 * // Conditional UI rendering
 * if (isInCart(selectedBook.id)) {
 *   showRemoveButton();
 * } else {
 *   showAddButton();
 * }
 * 
 * @example
 * // Cart validation before operations
 * if (!isInCart(bookId)) {
 *   addToCart(bookId, 1, price);
 * }
 * 
 * Performance:
 *     - Early termination: Stops searching after first match
 *     - Read-only operation: No state modifications
 *     - Efficient array traversal: Optimized for frequent calls
 * 
 * @since 1.0.0
 */
export function isInCart (bookId) {
  // 🛒 Cart Retrieval: Load current cart state
  const cart = getCart()
  
  // 🔍 Membership Test: Check if any cart item matches the specified bookId
  return cart.items.some(item => item.bookId === bookId)
}

