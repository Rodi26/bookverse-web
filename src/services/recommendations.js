/**
 * BookVerse Web Application - Recommendations Service Integration
 *
 * This module provides comprehensive integration with the BookVerse AI-powered
 * Recommendations Service, implementing personalized book suggestions, trending
 * discovery, and similarity-based recommendations for enhanced user experience
 * and increased engagement.
 *
 * 🏗️ Architecture Overview:
 *     - AI-Powered Recommendations: Machine learning algorithms for personalized suggestions
 *     - Content-Based Filtering: Similarity recommendations based on book metadata
 *     - Collaborative Filtering: User behavior-driven recommendation engine
 *     - Trending Analysis: Real-time popularity and engagement tracking
 *     - Personalization Engine: User preference learning and adaptation
 *
 * 🚀 Key Features:
 *     - Personalized recommendations based on user reading history and preferences
 *     - Similar book discovery using content-based filtering algorithms
 *     - Trending book identification with real-time popularity metrics
 *     - Configurable recommendation limits for different UI contexts
 *     - A/B testing support for recommendation algorithm optimization
 *     - Real-time learning from user interactions and feedback
 *
 * 🔧 Technical Implementation:
 *     - RESTful API integration with ML-powered recommendation engine
 *     - POST requests for complex personalization payloads
 *     - GET requests for simple similarity and trending queries
 *     - JSON payload construction for user preference data
 *     - HTTP layer abstraction for retry logic and error handling
 *
 * 📊 Business Logic:
 *     - Increased user engagement through personalized book discovery
 *     - Cross-selling and upselling through intelligent recommendations
 *     - User retention improvement via relevant content suggestions
 *     - Revenue optimization through targeted book recommendations
 *     - Analytics-driven recommendation performance optimization
 *
 * 🛠️ Usage Patterns:
 *     - Product detail page "similar books" sections
 *     - Homepage trending books display
 *     - Personalized user dashboard recommendations
 *     - Shopping cart cross-sell suggestions
 *     - Email marketing campaign content generation
 *
 * Authors: BookVerse Platform Team
 * Version: 1.0.0
 */

import { httpJson } from './http.js'

/**
 * Retrieve books similar to a specified book using content-based filtering.
 * 
 * This function leverages advanced machine learning algorithms to find books
 * with similar characteristics, themes, genres, and metadata. It's essential
 * for product discovery and cross-selling on product detail pages.
 * 
 * 🎯 Purpose:
 *     - Enable "customers who viewed this also viewed" functionality
 *     - Support cross-selling and upselling on product pages
 *     - Provide content discovery based on book similarity
 *     - Enhance user engagement through relevant suggestions
 *     - Support recommendation widget development
 * 
 * 🔧 ML Algorithm Features:
 *     - Content-based filtering using book metadata and features
 *     - Genre similarity weighting and author correlation analysis
 *     - Popularity-adjusted similarity scoring for quality recommendations
 *     - Real-time algorithm updates with user interaction feedback
 *     - A/B testing support for recommendation optimization
 * 
 * 📊 Response Structure:
 *     The API returns recommendation objects containing:
 *     - recommendations: Array of similar book objects with similarity scores
 *     - algorithm_version: ML model version for debugging and analytics
 *     - confidence_scores: Individual confidence metrics for each recommendation
 *     - explanations: Human-readable reasons for recommendations
 * 
 * @param {string} bookId - Unique identifier of the source book for similarity matching
 * @param {number} [limit=10] - Maximum number of similar books to return (1-50 range)
 * @returns {Promise<Object>} Promise resolving to similar books recommendation response
 * @returns {Array} returns.recommendations - Array of similar book objects with scores
 * @returns {string} returns.algorithm_version - ML model version identifier
 * @returns {Array} returns.confidence_scores - Confidence metrics for recommendations
 * 
 * @throws {Error} HTTP errors from recommendations service or network issues
 * 
 * @example
 * // Basic similar books for product detail page
 * const similarBooks = await getSimilar('book-uuid-123');
 * renderSimilarBooksSection(similarBooks.recommendations);
 * 
 * @example
 * // Load more similar books for extended recommendations
 * const extendedSimilar = await getSimilar('book-uuid-456', 20);
 * extendedSimilar.recommendations.forEach(book => {
 *   console.log(`${book.title} (similarity: ${book.similarity_score})`);
 * });
 * 
 * @example
 * // Handle recommendations with confidence scoring
 * const recommendations = await getSimilar(currentBookId, 15);
 * const highConfidenceRecs = recommendations.recommendations.filter(
 *   rec => rec.confidence_score > 0.8
 * );
 * 
 * if (highConfidenceRecs.length > 0) {
 *   displayPremiumRecommendations(highConfidenceRecs);
 * }
 * 
 * @example
 * // Error handling for recommendation failures
 * try {
 *   const similar = await getSimilar(bookId, 12);
 *   updateRecommendationsWidget(similar);
 * } catch (error) {
 *   console.error('Failed to load recommendations:', error.message);
 *   hideRecommendationsSection();
 * }
 * 
 * @since 1.0.0
 */
export async function getSimilar (bookId, limit = 10) {
  // 🔧 Query Parameter Construction: Build safe URL parameters for ML API
  const qs = new URLSearchParams({ 
    book_id: bookId, 
    limit: String(limit) 
  })
  
  return httpJson('recommendations', `/api/v1/recommendations/similar?${qs.toString()}`)
}

/**
 * Retrieve currently trending books based on real-time popularity metrics.
 * 
 * This function accesses the trending algorithm that analyzes real-time user
 * behavior, purchase patterns, and engagement metrics to identify books with
 * increasing popularity and viral potential for homepage and discovery features.
 * 
 * 🎯 Purpose:
 *     - Enable homepage trending books sections
 *     - Support viral content discovery and social proof
 *     - Provide time-sensitive recommendations for marketing campaigns
 *     - Enable trending widgets and promotional content
 *     - Support real-time content curation for user engagement
 * 
 * 🔧 Trending Algorithm Features:
 *     - Real-time popularity scoring with velocity analysis
 *     - Multi-factor trending detection (views, purchases, ratings, shares)
 *     - Time-decay weighting for recent activity emphasis
 *     - Genre-balanced trending to ensure diverse recommendations
 *     - Viral detection algorithms for emerging popular content
 * 
 * 📊 Trending Metrics:
 *     Each trending book includes:
 *     - trending_score: Composite popularity and velocity metric
 *     - velocity: Rate of popularity increase over time
 *     - engagement_metrics: Views, clicks, and interaction data
 *     - time_in_trend: Duration the book has been trending
 *     - category_rank: Position within genre-specific trending lists
 * 
 * @param {number} [limit=10] - Maximum number of trending books to return (1-100 range)
 * @returns {Promise<Object>} Promise resolving to trending books response
 * @returns {Array} returns.recommendations - Array of trending book objects with metrics
 * @returns {Object} returns.trending_metadata - Algorithm parameters and update timestamps
 * @returns {Object} returns.category_breakdown - Trending books by genre/category
 * 
 * @throws {Error} HTTP errors from recommendations service or network issues
 * 
 * @example
 * // Basic trending books for homepage
 * const trending = await getTrending();
 * renderTrendingSection(trending.recommendations);
 * 
 * @example
 * // Load extended trending list for discovery page
 * const trendingExtended = await getTrending(25);
 * displayTrendingCarousel(trendingExtended.recommendations);
 * 
 * @example
 * // Analyze trending velocity for marketing insights
 * const trending = await getTrending(50);
 * const fastRising = trending.recommendations.filter(
 *   book => book.velocity > 0.8
 * );
 * 
 * if (fastRising.length > 0) {
 *   createMarketingCampaign(fastRising);
 * }
 * 
 * @example
 * // Category-specific trending analysis
 * const trending = await getTrending(30);
 * const categoryBreakdown = trending.category_breakdown;
 * 
 * Object.entries(categoryBreakdown).forEach(([category, books]) => {
 *   renderCategoryTrending(category, books);
 * });
 * 
 * @example
 * // Handle trending data for social media integration
 * try {
 *   const trending = await getTrending(10);
 *   const topTrending = trending.recommendations[0];
 *   
 *   shareToSocialMedia({
 *     title: `📚 Trending Now: ${topTrending.title}`,
 *     description: `Join ${topTrending.engagement_metrics.total_readers} readers discovering this trending book!`,
 *     url: `/book/${topTrending.id}`
 *   });
 * } catch (error) {
 *   console.error('Failed to load trending books:', error.message);
 * }
 * 
 * @since 1.0.0
 */
export async function getTrending (limit = 10) {
  // 🔧 Query Parameter Construction: Build safe URL parameters for trending API
  const qs = new URLSearchParams({ 
    limit: String(limit) 
  })
  
  return httpJson('recommendations', `/api/v1/recommendations/trending?${qs.toString()}`)
}

/**
 * Retrieve personalized book recommendations based on user preferences and behavior.
 * 
 * This function leverages sophisticated machine learning algorithms to generate
 * highly personalized recommendations using user reading history, preferences,
 * demographic data, and real-time behavior patterns for maximum relevance.
 * 
 * 🎯 Purpose:
 *     - Enable personalized user dashboard recommendations
 *     - Support targeted email marketing campaigns
 *     - Provide user-specific homepage content customization
 *     - Enable adaptive user experience optimization
 *     - Support advanced recommendation widget personalization
 * 
 * 🔧 Personalization Features:
 *     - Collaborative filtering using user behavior patterns
 *     - Content-based filtering with user preference weighting
 *     - Hybrid recommendation algorithms for optimal accuracy
 *     - Real-time preference learning and adaptation
 *     - Cold start handling for new users with minimal data
 *     - A/B testing framework for algorithm optimization
 * 
 * 📊 Payload Structure:
 *     The personalization payload can include:
 *     - user_id: Unique user identifier for preference lookup
 *     - reading_history: Array of previously read or purchased books
 *     - explicit_preferences: User-specified genre and author preferences
 *     - demographic_data: Age, location, and other relevant user attributes
 *     - recent_behavior: Current session activity and browsing patterns
 *     - context: Current page, time of day, and situational factors
 * 
 * @param {Object} [payload={}] - Personalization data and user context
 * @param {string} [payload.user_id] - Unique user identifier
 * @param {Array} [payload.reading_history] - Previously read books array
 * @param {Object} [payload.preferences] - Explicit user preferences object
 * @param {Array} [payload.recent_activity] - Current session behavior data
 * @param {Object} [payload.context] - Situational context for recommendations
 * @param {number} [payload.limit] - Maximum number of recommendations to return
 * @returns {Promise<Object>} Promise resolving to personalized recommendations response
 * @returns {Array} returns.recommendations - Array of personalized book suggestions
 * @returns {Object} returns.personalization_metadata - Algorithm confidence and parameters
 * @returns {Object} returns.explanation - Human-readable recommendation reasons
 * 
 * @throws {Error} HTTP errors from recommendations service or network issues
 * 
 * @example
 * // Basic personalized recommendations for logged-in user
 * const personalized = await getPersonalized({
 *   user_id: 'user-uuid-123',
 *   limit: 15
 * });
 * renderPersonalizedDashboard(personalized.recommendations);
 * 
 * @example
 * // Advanced personalization with reading history
 * const recommendations = await getPersonalized({
 *   user_id: 'user-uuid-456',
 *   reading_history: [
 *     { book_id: 'book-1', rating: 5, read_date: '2024-01-15' },
 *     { book_id: 'book-2', rating: 4, read_date: '2024-01-20' }
 *   ],
 *   preferences: {
 *     favorite_genres: ['science-fiction', 'fantasy'],
 *     favorite_authors: ['Isaac Asimov', 'Ursula K. Le Guin'],
 *     preferred_length: 'medium'
 *   },
 *   limit: 20
 * });
 * 
 * @example
 * // Context-aware recommendations for current page
 * const contextualRecs = await getPersonalized({
 *   user_id: getCurrentUserId(),
 *   context: {
 *     current_page: 'checkout',
 *     time_of_day: 'evening',
 *     device_type: 'mobile',
 *     session_duration: 1800
 *   },
 *   recent_activity: [
 *     { action: 'viewed', book_id: 'book-123', timestamp: Date.now() - 300000 },
 *     { action: 'cart_add', book_id: 'book-456', timestamp: Date.now() - 600000 }
 *   ]
 * });
 * 
 * renderCheckoutRecommendations(contextualRecs.recommendations);
 * 
 * @example
 * // Handle cold start scenarios for new users
 * const newUserRecs = await getPersonalized({
 *   preferences: {
 *     onboarding_genres: ['mystery', 'thriller'],
 *     reading_frequency: 'weekly',
 *     experience_level: 'intermediate'
 *   },
 *   context: {
 *     is_new_user: true,
 *     signup_source: 'social_media',
 *     referral_context: 'friend_recommendation'
 *   }
 * });
 * 
 * showNewUserOnboarding(newUserRecs.recommendations);
 * 
 * @example
 * // Error handling with fallback to trending
 * try {
 *   const personalized = await getPersonalized(userPayload);
 *   displayRecommendations(personalized.recommendations);
 * } catch (error) {
 *   console.error('Personalization failed:', error.message);
 *   
 *   // Fallback to trending recommendations
 *   const fallback = await getTrending(10);
 *   displayRecommendations(fallback.recommendations, 'trending');
 * }
 * 
 * @since 1.0.0
 */
export async function getPersonalized (payload) {
  return httpJson('recommendations', '/api/v1/recommendations/personalized', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  })
}

