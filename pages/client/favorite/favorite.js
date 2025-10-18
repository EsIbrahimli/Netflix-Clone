// Favorites Page JavaScript
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/pages/client/login/login.html';
}

// DOM Elements
const loadingContainer = document.getElementById('loading-container');
const errorContainer = document.getElementById('error-container');
const emptyContainer = document.getElementById('empty-container');
const contentContainer = document.getElementById('content-container');
const favoritesCount = document.getElementById('favorites-count');
const categoryFilter = document.getElementById('category-filter');
const sortSelect = document.getElementById('sort-select');
const gridView = document.getElementById('grid-view');
const listView = document.getElementById('list-view');
const favoritesGrid = document.getElementById('favorites-grid');
const pagination = document.getElementById('pagination');
const batchActions = document.getElementById('batch-actions');
const selectedCount = document.getElementById('selected-count');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const removeSelectedBtn = document.getElementById('remove-selected-btn');
const retryBtn = document.getElementById('retry-btn');
const movieModal = document.getElementById('movie-modal');
const modalClose = document.getElementById('modal-close');
const toastContainer = document.getElementById('toast-container');

// Global variables
let allFavorites = [];
let filteredFavorites = [];
let currentView = 'grid';
let currentPage = 1;
let itemsPerPage = 20;
let selectedMovies = new Set();
let categories = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupNavbarEffects();
    loadFavorites();
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
    // View controls
    gridView.addEventListener('click', () => switchView('grid'));
    listView.addEventListener('click', () => switchView('list'));

    // Filters and sorting
    categoryFilter.addEventListener('change', applyFilters);
    sortSelect.addEventListener('change', applyFilters);

    // Batch actions
    selectAllBtn.addEventListener('click', selectAllMovies);
    deselectAllBtn.addEventListener('click', deselectAllMovies);
    removeSelectedBtn.addEventListener('click', removeSelectedMovies);

    // Retry button
    retryBtn.addEventListener('click', loadFavorites);

    // Modal
    modalClose.addEventListener('click', closeModal);
    movieModal.addEventListener('click', (e) => {
        if (e.target === movieModal) {
            closeModal();
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
            closeModal();
        }
    });
}

// Load favorites from API
async function loadFavorites() {
    try {
        showLoading();
        
        const [favoritesData, categoriesData] = await Promise.all([
            fetchFavorites(),
            fetchCategories()
        ]);

        allFavorites = favoritesData || [];
        categories = categoriesData || [];
        
        populateCategoryFilter();
        applyFilters();
        
        if (allFavorites.length === 0) {
            showEmptyState();
        } else {
            showContent();
            updateFavoritesCount();
        }
        
    } catch (error) {
        console.error('Error loading favorites:', error);
        showErrorState();
    }
}

// Fetch favorites from API
async function fetchFavorites() {
    try {
        const response = await fetch(`${API_BASE}/favorite`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/pages/client/login/login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw error;
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

// Apply filters and sorting
function applyFilters() {
    let filtered = [...allFavorites];
    
    // Filter by category
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(movie => 
            movie.category && movie.category._id === selectedCategory
        );
    }
    
    // Sort
    const sortBy = sortSelect.value;
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
        case 'recent':
        default:
            // Keep original order (most recently added first)
            break;
    }
    
    filteredFavorites = filtered;
    currentPage = 1;
    renderFavorites();
    renderPagination();
}

// Switch between grid and list view
function switchView(view) {
    currentView = view;
    
    gridView.classList.toggle('active', view === 'grid');
    listView.classList.toggle('active', view === 'list');
    
    favoritesGrid.classList.toggle('list-view', view === 'list');
    renderFavorites();
}

// Render favorites
function renderFavorites() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageMovies = filteredFavorites.slice(startIndex, endIndex);
    
    favoritesGrid.innerHTML = '';
    
    if (pageMovies.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No movies found</h3>
                <p>Try adjusting your filters or add more movies to your favorites.</p>
            </div>
        `;
        return;
    }
    
    pageMovies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        favoritesGrid.appendChild(movieCard);
    });
}

// Create movie card element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = `movie-card ${currentView}`;
    card.dataset.movieId = movie._id;
    
    const isSelected = selectedMovies.has(movie._id);
    if (isSelected) {
        card.classList.add('selected');
    }
    
    card.innerHTML = `
        <div class="movie-checkbox ${selectedMovies.size > 0 ? 'visible' : ''}">
            <i class="fas fa-check"></i>
        </div>
        <div class="movie-poster">
            <img src="${movie.cover || '/assets/icons/title-movie.svg'}" 
                 alt="${movie.title}"
                 onerror="this.src='/assets/icons/title-movie.svg'">
            <div class="movie-overlay">
                <div class="movie-actions">
                    <button class="movie-action-btn" onclick="playMovie('${movie._id}')" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="movie-action-btn" onclick="removeFromFavorites('${movie._id}')" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="movie-action-btn" onclick="showMovieDetails('${movie._id}')" title="Details">
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
    
    // Add click handlers
    card.addEventListener('click', (e) => {
        if (e.target.closest('.movie-action-btn')) return;
        
        if (selectedMovies.size > 0) {
            toggleMovieSelection(movie._id);
        } else {
            window.location.href = `/pages/client/detailed/detailed.html?id=${movie._id}`;
        }
    });
    
    return card;
}

// Toggle movie selection
function toggleMovieSelection(movieId) {
    if (selectedMovies.has(movieId)) {
        selectedMovies.delete(movieId);
    } else {
        selectedMovies.add(movieId);
    }
    
    updateSelectionUI();
    renderFavorites();
}

// Update selection UI
function updateSelectionUI() {
    const count = selectedMovies.size;
    
    if (count > 0) {
        batchActions.style.display = 'flex';
        selectedCount.textContent = count;
        document.body.classList.add('selection-mode');
    } else {
        batchActions.style.display = 'none';
        document.body.classList.remove('selection-mode');
    }
    
    // Update checkbox visibility
    const checkboxes = document.querySelectorAll('.movie-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.style.display = count > 0 ? 'flex' : 'none';
    });
}

// Select all movies
function selectAllMovies() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageMovies = filteredFavorites.slice(startIndex, endIndex);
    
    pageMovies.forEach(movie => {
        selectedMovies.add(movie._id);
    });
    
    updateSelectionUI();
    renderFavorites();
}

// Deselect all movies
function deselectAllMovies() {
    selectedMovies.clear();
    updateSelectionUI();
    renderFavorites();
}

// Remove selected movies
async function removeSelectedMovies() {
    if (selectedMovies.size === 0) return;
    
    const confirmed = confirm(`Are you sure you want to remove ${selectedMovies.size} movie(s) from your favorites?`);
    if (!confirmed) return;
    
    try {
        const promises = Array.from(selectedMovies).map(movieId => 
            removeFromFavoritesAPI(movieId)
        );
        
        await Promise.all(promises);
        
        // Remove from local arrays
        allFavorites = allFavorites.filter(movie => !selectedMovies.has(movie._id));
        filteredFavorites = filteredFavorites.filter(movie => !selectedMovies.has(movie._id));
        
        selectedMovies.clear();
        updateSelectionUI();
        
        if (allFavorites.length === 0) {
            showEmptyState();
        } else {
            renderFavorites();
            renderPagination();
            updateFavoritesCount();
        }
        
        showToast(`Removed ${selectedMovies.size} movie(s) from favorites`, 'success');
        
    } catch (error) {
        console.error('Error removing movies:', error);
        showToast('Failed to remove some movies. Please try again.', 'error');
    }
}

// Remove single movie from favorites
async function removeFromFavorites(movieId) {
    try {
        await removeFromFavoritesAPI(movieId);
        
        allFavorites = allFavorites.filter(movie => movie._id !== movieId);
        filteredFavorites = filteredFavorites.filter(movie => movie._id !== movieId);
        
        if (allFavorites.length === 0) {
            showEmptyState();
        } else {
            renderFavorites();
            renderPagination();
            updateFavoritesCount();
        }
        
        showToast('Removed from favorites', 'success');
        
    } catch (error) {
        console.error('Error removing movie:', error);
        showToast('Failed to remove movie. Please try again.', 'error');
    }
}

// API call to remove from favorites
async function removeFromFavoritesAPI(movieId) {
    const response = await fetch(`${API_BASE}/favorite/remove/${movieId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

// Play movie
function playMovie(movieId) {
    const movie = allFavorites.find(m => m._id === movieId);
    if (movie && movie.watch) {
        window.open(movie.watch, '_blank');
    } else {
        showToast('Play link not available', 'warning');
    }
}

// Show movie details modal
async function showMovieDetails(movieId) {
    try {
        const movie = allFavorites.find(m => m._id === movieId);
        if (!movie) return;
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        
        modalTitle.textContent = movie.title;
        modalBody.innerHTML = `
            <div class="movie-detail-modal">
                <div class="modal-poster">
                    <img src="${movie.cover || '/assets/icons/title-movie.svg'}" alt="${movie.title}">
                </div>
                <div class="modal-info">
                    <div class="modal-meta">
                        ${movie.imdb ? `<span class="imdb-rating">★ ${movie.imdb}</span>` : ''}
                        ${movie.runTimeMin ? `<span>${movie.runTimeMin} min</span>` : ''}
                        ${movie.category ? `<span class="category">${movie.category.name}</span>` : ''}
                    </div>
                    <p class="modal-description">${movie.overview || 'No description available.'}</p>
                    <div class="modal-actions">
                        <button class="btn-play" onclick="playMovie('${movie._id}')">
                            <i class="fas fa-play"></i> Play Now
                        </button>
                        <button class="btn-remove" onclick="removeFromFavorites('${movie._id}'); closeModal();">
                            <i class="fas fa-trash"></i> Remove from Favorites
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        movieModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error showing movie details:', error);
        showToast('Failed to load movie details', 'error');
    }
}

// Close modal
function closeModal() {
    movieModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">${i}</button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-info">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    // Page info
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredFavorites.length);
    
    paginationHTML += `
        <span class="pagination-info">
            Showing ${startIndex}-${endIndex} of ${filteredFavorites.length} movies
        </span>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderFavorites();
        renderPagination();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update favorites count
function updateFavoritesCount() {
    const count = allFavorites.length;
    favoritesCount.textContent = `${count} favorite${count !== 1 ? 's' : ''}`;
}

// Show loading state
function showLoading() {
    loadingContainer.style.display = 'flex';
    errorContainer.style.display = 'none';
    emptyContainer.style.display = 'none';
    contentContainer.style.display = 'none';
}

// Show error state
function showErrorState() {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'flex';
    emptyContainer.style.display = 'none';
    contentContainer.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    emptyContainer.style.display = 'flex';
    contentContainer.style.display = 'none';
}

// Show content state
function showContent() {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    emptyContainer.style.display = 'none';
    contentContainer.style.display = 'block';
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
    showToast('You are now offline. Some features may be limited.', 'warning');
});
