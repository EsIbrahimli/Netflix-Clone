// Search Panel JavaScript
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/pages/client/login/login.html';
}

// DOM Elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const searchSuggestions = document.getElementById('search-suggestions');
const suggestionsList = document.getElementById('suggestions-list');
const recentSearches = document.getElementById('recent-searches');
const recentList = document.getElementById('recent-list');
const clearRecentBtn = document.getElementById('clear-recent');
const trendingSection = document.getElementById('trending-section');
const trendingGrid = document.getElementById('trending-grid');
const searchResults = document.getElementById('search-results');
const resultsTitle = document.getElementById('results-title');
const resultsCount = document.getElementById('results-count');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const resultsGrid = document.getElementById('results-grid');
const noResults = document.getElementById('no-results');
const loadMoreContainer = document.getElementById('load-more-container');
const loadMoreBtn = document.getElementById('load-more-btn');
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const retrySearchBtn = document.getElementById('retry-search');
const previewModal = document.getElementById('preview-modal');
const modalClose = document.getElementById('modal-close');
const toastContainer = document.getElementById('toast-container');

// Global variables
let searchTimeout;
let currentQuery = '';
let searchResultsData = [];
let filteredResults = [];
let currentPage = 1;
let hasMoreResults = false;
let categories = [];
let recentSearchTerms = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupNavbarEffects();
    loadInitialData();
    loadRecentSearches();
});

// Setup navbar scroll effects
function setupNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Profile menu toggle
    const profileMenu = document.querySelector('.profile-menu');
    if (profileMenu) {
        profileMenu.addEventListener('click', () => {
            profileMenu.classList.toggle('active');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (profileMenu && !profileMenu.contains(e.target)) {
            profileMenu.classList.remove('active');
        }
    });

    // Logout functionality
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/index.html';
        });
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    searchInput.addEventListener('input', handleSearchInput);
    searchInput.addEventListener('focus', showSuggestions);
    searchInput.addEventListener('blur', hideSuggestionsOnBlur);
    
    // Clear search
    clearSearchBtn.addEventListener('click', clearSearch);
    
    // Filters
    categoryFilter.addEventListener('change', applyFilters);
    sortFilter.addEventListener('change', applyFilters);
    
    // Load more
    loadMoreBtn.addEventListener('click', loadMoreResults);
    
    // Retry search
    retrySearchBtn.addEventListener('click', () => {
        if (currentQuery) {
            performSearch(currentQuery);
        }
    });
    
    // Clear recent searches
    clearRecentBtn.addEventListener('click', clearRecentSearches);
    
    // Modal
    modalClose.addEventListener('click', closePreviewModal);
    previewModal.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            closePreviewModal();
        }
    });
    
    // Logout
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
    
    // Profile menu toggle
    const profileMenu = document.querySelector('.profile-menu');
    profileMenu.addEventListener('click', () => {
        profileMenu.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileMenu.contains(e.target)) {
            profileMenu.classList.remove('active');
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closePreviewModal();
            hideSuggestions();
        } else if (e.key === 'Enter' && e.target === searchInput) {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        }
    });
}

// Load initial data
async function loadInitialData() {
    try {
        const [categoriesData, trendingData] = await Promise.all([
            fetchCategories(),
            fetchTrendingMovies()
        ]);
        
        categories = categoriesData || [];
        populateCategoryFilter();
        renderTrendingMovies(trendingData || []);
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Failed to load some content', 'warning');
    }
}

// Fetch categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE}/category`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.data || [];
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
    return [];
}

// Fetch trending movies
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${API_BASE}/movie?limit=12&sort=imdb`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.data || [];
        }
    } catch (error) {
        console.error('Error fetching trending movies:', error);
    }
    return [];
}

// Populate category filter
function populateCategoryFilter() {
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category._id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Render trending movies
function renderTrendingMovies(movies) {
    trendingGrid.innerHTML = '';
    
    if (movies.length === 0) {
        trendingGrid.innerHTML = `
            <div class="no-trending">
                <i class="fas fa-film"></i>
                <p>No trending movies available</p>
            </div>
        `;
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        trendingGrid.appendChild(movieCard);
    });
}

// Handle search input
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    // Show/hide clear button
    clearSearchBtn.style.display = query ? 'block' : 'none';
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (query.length > 0) {
        // Show suggestions after a short delay
        searchTimeout = setTimeout(() => {
            showSearchSuggestions(query);
        }, 300);
    } else {
        hideSuggestions();
        showTrendingSection();
    }
}

// Show search suggestions
async function showSearchSuggestions(query) {
    try {
        const suggestions = await fetchSearchSuggestions(query);
        renderSuggestions(suggestions);
        searchSuggestions.style.display = 'block';
        recentSearches.style.display = 'none';
        trendingSection.style.display = 'none';
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
}

// Fetch search suggestions
async function fetchSearchSuggestions(query) {
    try {
        const response = await fetch(`${API_BASE}/search/suggestions?q=${encodeURIComponent(query)}&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.data || [];
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
    
    // Fallback: return empty suggestions
    return [];
}

// Render suggestions
function renderSuggestions(suggestions) {
    suggestionsList.innerHTML = '';
    
    if (suggestions.length === 0) {
        suggestionsList.innerHTML = `
            <div class="suggestion-item">
                <i class="fas fa-search suggestion-icon"></i>
                <span class="suggestion-text">No suggestions found</span>
            </div>
        `;
        return;
    }
    
    suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        
        const icon = suggestion.type === 'movie' ? 'film' : 
                    suggestion.type === 'actor' ? 'user' : 'search';
        
        item.innerHTML = `
            <i class="fas fa-${icon} suggestion-icon"></i>
            <span class="suggestion-text">${suggestion.title}</span>
            <span class="suggestion-type">${suggestion.type}</span>
        `;
        
        item.addEventListener('click', () => {
            searchInput.value = suggestion.title;
            performSearch(suggestion.title);
        });
        
        suggestionsList.appendChild(item);
    });
}

// Perform search
async function performSearch(query) {
    if (!query.trim()) return;
    
    currentQuery = query.trim();
    
    // Add to recent searches
    addToRecentSearches(query);
    
    // Hide suggestions and show loading
    hideSuggestions();
    showLoading();
    
    try {
        const results = await fetchSearchResults(query);
        searchResultsData = results || [];
        filteredResults = [...searchResultsData];
        currentPage = 1;
        
        if (filteredResults.length === 0) {
            showNoResults();
        } else {
            renderSearchResults();
            updateResultsInfo();
        }
        
        hideLoading();
        
    } catch (error) {
        console.error('Error performing search:', error);
        hideLoading();
        showError();
    }
}

// Fetch search results
async function fetchSearchResults(query) {
    try {
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=20&page=${currentPage}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        hasMoreResults = data.hasMore || false;
        return data.data || [];
    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
}

// Render search results
function renderSearchResults() {
    resultsGrid.innerHTML = '';
    
    filteredResults.forEach(movie => {
        const movieCard = createMovieCard(movie);
        resultsGrid.appendChild(movieCard);
    });
    
    // Show/hide load more button
    loadMoreContainer.style.display = hasMoreResults ? 'block' : 'none';
    
    // Show results section
    searchResults.style.display = 'block';
    noResults.style.display = 'none';
    trendingSection.style.display = 'none';
    recentSearches.style.display = 'none';
}

// Create movie card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    
    card.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.cover || '/assets/icons/title-movie.svg'}" 
                 alt="${movie.title}"
                 onerror="this.src='/assets/icons/title-movie.svg'">
            <div class="movie-overlay">
                <div class="movie-actions">
                    <button class="movie-action-btn" onclick="playMovie('${movie._id}')" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="movie-action-btn" onclick="toggleFavorite('${movie._id}')" title="Add to Favorites">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="movie-action-btn" onclick="showPreview('${movie._id}')" title="Quick Preview">
                        <i class="fas fa-info"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                ${movie.imdb ? `<span class="imdb-rating">★ ${movie.imdb}</span>` : ''}
                ${movie.runTimeMin ? `<span>${movie.runTimeMin} min</span>` : ''}
                ${movie.category ? `<span class="movie-category">${movie.category.name}</span>` : ''}
            </div>
            ${movie.overview ? `<p class="movie-description">${movie.overview}</p>` : ''}
        </div>
    `;
    
    // Add click handler for card
    card.addEventListener('click', (e) => {
        if (e.target.closest('.movie-action-btn')) return;
        window.location.href = `/pages/client/detailed/detailed.html?id=${movie._id}`;
    });
    
    return card;
}

// Apply filters
function applyFilters() {
    const selectedCategory = categoryFilter.value;
    const sortBy = sortFilter.value;
    
    let filtered = [...searchResultsData];
    
    // Filter by category
    if (selectedCategory) {
        filtered = filtered.filter(movie => 
            movie.category && movie.category._id === selectedCategory
        );
    }
    
    // Sort
    switch (sortBy) {
        case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'rating':
            filtered.sort((a, b) => (b.imdb || 0) - (a.imdb || 0));
            break;
        case 'year':
            filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'relevance':
        default:
            // Keep original order
            break;
    }
    
    filteredResults = filtered;
    renderSearchResults();
    updateResultsInfo();
}

// Load more results
async function loadMoreResults() {
    if (!hasMoreResults) return;
    
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    try {
        currentPage++;
        const moreResults = await fetchSearchResults(currentQuery);
        
        searchResultsData = [...searchResultsData, ...moreResults];
        filteredResults = [...searchResultsData];
        
        renderSearchResults();
        updateResultsInfo();
        
    } catch (error) {
        console.error('Error loading more results:', error);
        showToast('Failed to load more results', 'error');
        currentPage--; // Revert page increment
    } finally {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-plus"></i> Load More';
    }
}

// Update results info
function updateResultsInfo() {
    resultsTitle.textContent = `Search Results for "${currentQuery}"`;
    resultsCount.textContent = `${filteredResults.length} result${filteredResults.length !== 1 ? 's' : ''}`;
}

// Show no results
function showNoResults() {
    noResults.style.display = 'block';
    searchResults.style.display = 'block';
    resultsGrid.innerHTML = '';
    loadMoreContainer.style.display = 'none';
    trendingSection.style.display = 'none';
    recentSearches.style.display = 'none';
    
    resultsTitle.textContent = `No Results for "${currentQuery}"`;
    resultsCount.textContent = '0 results';
}

// Show trending section
function showTrendingSection() {
    trendingSection.style.display = 'block';
    searchResults.style.display = 'none';
    noResults.style.display = 'none';
    recentSearches.style.display = 'none';
}

// Clear search
function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    hideSuggestions();
    showTrendingSection();
    currentQuery = '';
}

// Show suggestions
function showSuggestions() {
    if (searchInput.value.trim()) {
        showSearchSuggestions(searchInput.value.trim());
    } else {
        recentSearches.style.display = 'block';
        searchSuggestions.style.display = 'none';
        trendingSection.style.display = 'none';
    }
}

// Hide suggestions
function hideSuggestions() {
    searchSuggestions.style.display = 'none';
}

// Hide suggestions on blur (with delay)
function hideSuggestionsOnBlur() {
    setTimeout(() => {
        if (!document.activeElement.closest('.search-suggestions') && 
            !document.activeElement.closest('.recent-searches')) {
            hideSuggestions();
            recentSearches.style.display = 'none';
        }
    }, 200);
}

// Load recent searches
function loadRecentSearches() {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
        try {
            recentSearchTerms = JSON.parse(stored);
            renderRecentSearches();
        } catch (error) {
            console.error('Error parsing recent searches:', error);
            recentSearchTerms = [];
        }
    }
}

// Render recent searches
function renderRecentSearches() {
    recentList.innerHTML = '';
    
    if (recentSearchTerms.length === 0) {
        recentList.innerHTML = `
            <div class="recent-item">
                <span class="recent-text">No recent searches</span>
            </div>
        `;
        return;
    }
    
    recentSearchTerms.slice(0, 5).forEach(term => {
        const item = document.createElement('div');
        item.className = 'recent-item';
        
        item.innerHTML = `
            <span class="recent-text">${term}</span>
            <button class="recent-remove" onclick="removeRecentSearch('${term}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.recent-remove')) {
                searchInput.value = term;
                performSearch(term);
            }
        });
        
        recentList.appendChild(item);
    });
}

// Add to recent searches
function addToRecentSearches(query) {
    // Remove if already exists
    recentSearchTerms = recentSearchTerms.filter(term => term !== query);
    
    // Add to beginning
    recentSearchTerms.unshift(query);
    
    // Keep only last 10
    recentSearchTerms = recentSearchTerms.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('recentSearches', JSON.stringify(recentSearchTerms));
    
    renderRecentSearches();
}

// Remove recent search
function removeRecentSearch(term) {
    recentSearchTerms = recentSearchTerms.filter(t => t !== term);
    localStorage.setItem('recentSearches', JSON.stringify(recentSearchTerms));
    renderRecentSearches();
}

// Clear recent searches
function clearRecentSearches() {
    recentSearchTerms = [];
    localStorage.removeItem('recentSearches');
    renderRecentSearches();
}

// Play movie
function playMovie(movieId) {
    const movie = searchResultsData.find(m => m._id === movieId) || 
                  trendingGrid.querySelector(`[data-movie-id="${movieId}"]`)?.movie;
    
    if (movie && movie.watch) {
        window.open(movie.watch, '_blank');
    } else {
        showToast('Play link not available', 'warning');
    }
}

// Toggle favorite
async function toggleFavorite(movieId) {
    try {
        const response = await fetch(`${API_BASE}/favorite/add/${movieId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Added to favorites!', 'success');
        } else {
            throw new Error('Failed to add to favorites');
        }
    } catch (error) {
        console.error('Error adding to favorites:', error);
        showToast('Failed to add to favorites', 'error');
    }
}

// Show preview modal
async function showPreview(movieId) {
    try {
        const movie = searchResultsData.find(m => m._id === movieId);
        if (!movie) return;
        
        const modalTitle = document.getElementById('preview-title');
        const modalBody = document.getElementById('preview-body');
        
        modalTitle.textContent = movie.title;
        modalBody.innerHTML = `
            <div class="movie-preview-modal">
                <div class="preview-poster">
                    <img src="${movie.cover || '/assets/icons/title-movie.svg'}" alt="${movie.title}">
                </div>
                <div class="preview-info">
                    <div class="preview-meta">
                        ${movie.imdb ? `<span class="imdb-rating">★ ${movie.imdb}</span>` : ''}
                        ${movie.runTimeMin ? `<span>${movie.runTimeMin} min</span>` : ''}
                        ${movie.category ? `<span class="category">${movie.category.name}</span>` : ''}
                    </div>
                    <p class="preview-description">${movie.overview || 'No description available.'}</p>
                    <div class="preview-actions">
                        <button class="btn-play" onclick="playMovie('${movie._id}')">
                            <i class="fas fa-play"></i> Play Now
                        </button>
                        <button class="btn-details" onclick="window.location.href='/pages/client/detailed/detailed.html?id=${movie._id}'">
                            <i class="fas fa-info-circle"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        previewModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error showing preview:', error);
        showToast('Failed to load preview', 'error');
    }
}

// Close preview modal
function closePreviewModal() {
    previewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show loading state
function showLoading() {
    loadingContainer.style.display = 'flex';
    errorContainer.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingContainer.style.display = 'none';
}

// Show error state
function showError() {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Handle offline/online events
window.addEventListener('online', () => {
    showToast('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
    showToast('You are now offline. Search functionality may be limited.', 'warning');
});
