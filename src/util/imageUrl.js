/**
 * Utility function to resolve book cover image URLs
 * @param {string} imageUrl - The image URL from the API (relative or absolute)
 * @param {string} inventoryBaseUrl - Base URL of the inventory service
 * @returns {string} - Resolved absolute URL
 */
export function resolveImageUrl(imageUrl, inventoryBaseUrl) {
  if (!imageUrl) {
    return '/placeholder-book.png' // Fallback image
  }
  
  // If it's already an absolute URL (starts with http/https), use as-is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it's a relative path (starts with /), prepend inventory base URL
  if (imageUrl.startsWith('/')) {
    return `${inventoryBaseUrl}${imageUrl}`
  }
  
  // If it's just a filename, assume it's in the static/images directory
  return `${inventoryBaseUrl}/static/images/${imageUrl}`
}
