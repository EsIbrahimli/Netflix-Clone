// Movie Detail Page JavaScript
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/pages/client/login/login.html';
}

// Get movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

if (!movieId) {
    showError('Movie ID not found in URL');
}

// DOM Elements
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');
const movieDetailContent = document.getElementById('movie-detail-content');
const movieHero = document.getElementById('movie-hero');
const movieTitle = document.getElementById('movie-title');
const imdbRating = document.getElementById('imdb-rating');
const runtime = document.getElementById('runtime');
const category = document.getElementById('category');
const year = document.getElementById('year');
const movieOverview = document.getElementById('movie-overview');
const btnPlay = document.getElementById('btn-play');
const btnTrailer = document.getElementById('btn-trailer');
const btnFavorite = document.getElementById('btn-favorite');
const detailedOverview = document.getElementById('detailed-overview');
const detailedRuntime = document.getElementById('detailed-runtime');
const detailedImdb = document.getElementById('detailed-imdb');
const detailedCategory = document.getElementById('detailed-category');
const detailedYear = document.getElementById('detailed-year');
const actorsList = document.getElementById('actors-list');
const moviePoster = document.getElementById('movie-poster');
const relatedMovies = document.getElementById('related-movies');
const trailerModal = document.getElementById('trailer-modal');
const modalClose = document.getElementById('modal-close');
const trailerContainer = document.getElementById('trailer-container');
const toastContainer = document.getElementById('toast-container');

// Global variables
let currentMovie = null;
let isFavorite = false;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadMovieDetails();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Play button
    btnPlay.addEventListener('click', () => {
        if (currentMovie && currentMovie.watch) {
            window.open(currentMovie.watch, '_blank');
        } else {
            showToast('Play link not available', 'warning');
        }
    });

    // Trailer button
    btnTrailer.addEventListener('click', () => {
        if (currentMovie && currentMovie.fragman) {
            showTrailer(currentMovie.fragman);
        } else {
            showToast('Trailer not available', 'warning');
        }
    });

    // Favorite button
    btnFavorite.addEventListener('click', toggleFavorite);
    
    // Quick action buttons
    document.getElementById('quick-favorite').addEventListener('click', toggleFavorite);
    document.getElementById('quick-share').addEventListener('click', shareMovie);
    document.getElementById('quick-watchlist').addEventListener('click', addToWatchlist);

    // Modal close
    modalClose.addEventListener('click', closeTrailerModal);
    trailerModal.addEventListener('click', (e) => {
        if (e.target === trailerModal) {
            closeTrailerModal();
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
}

// Load movie details
async function loadMovieDetails() {
    try {
        showLoading();
        
        const movie = await fetchMovieDetails(movieId);
        if (!movie) {
            throw new Error('Movie not found');
        }

        currentMovie = movie;
        await checkFavoriteStatus(movieId);
        renderMovieDetails(movie);
        await loadRelatedMovies(movie.category?._id);
        
        hideLoading();
        showContent();
        
    } catch (error) {
        console.error('Error loading movie details:', error);
        hideLoading();
        showError('Failed to load movie details. Please try again.');
    }
}

// Fetch movie details from API
async function fetchMovieDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/movie/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Movie not found');
            } else if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/pages/client/login/login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        throw error;
    }
}

// Check if movie is in favorites
async function checkFavoriteStatus(movieId) {
    try {
        const response = await fetch(`${API_BASE}/favorite/check/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            isFavorite = data.isFavorite || false;
        }
    } catch (error) {
        console.error('Error checking favorite status:', error);
        isFavorite = false;
    }
}

// Render movie details
function renderMovieDetails(movie) {
    // Hero section
    if (movie.cover) {
        const heroBackground = movieHero.querySelector('.hero-background');
        heroBackground.style.backgroundImage = `url(${movie.cover})`;
    }

    movieTitle.textContent = movie.title || 'Unknown Title';
    
    // Movie meta
    imdbRating.innerHTML = `<i class="fas fa-star"></i> ${movie.imdb || 'N/A'}`;
    runtime.textContent = movie.runTimeMin ? `${movie.runTimeMin} min` : 'Unknown';
    category.textContent = movie.category?.name || 'Unknown';
    year.textContent = new Date().getFullYear(); // You might want to get this from movie data
    
    movieOverview.textContent = movie.overview || 'No description available';
    
    // Detailed info
    detailedOverview.textContent = movie.overview || 'No detailed description available';
    detailedRuntime.textContent = movie.runTimeMin ? `${movie.runTimeMin} minutes` : 'Unknown duration';
    detailedImdb.textContent = movie.imdb ? `${movie.imdb}/10` : 'N/A';
    detailedCategory.textContent = movie.category?.name || 'Unknown category';
    detailedYear.textContent = new Date().getFullYear();
    
    // Poster
    if (movie.cover) {
        moviePoster.src = movie.cover;
        moviePoster.alt = movie.title;
    }
    
    // Actors
    renderActors(movie.actors || []);
    
    // Update favorite button
    updateFavoriteButton();
}

// Render actors
function renderActors(actors) {
    actorsList.innerHTML = '';
    
    if (actors.length === 0) {
        actorsList.innerHTML = '<div class="actor-placeholder">Cast information not available</div>';
        return;
    }
    
    actors.forEach(actor => {
        const actorElement = document.createElement('div');
        actorElement.className = 'actor-item';
        actorElement.textContent = actor.name || actor;
        actorsList.appendChild(actorElement);
    });
}

// Load related movies
async function loadRelatedMovies(categoryId) {
    try {
        const response = await fetch(`${API_BASE}/movie?category=${categoryId}&limit=6`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const movies = data.data || [];
            
            // Filter out current movie
            const relatedMoviesList = movies.filter(movie => movie._id !== movieId);
            renderRelatedMovies(relatedMoviesList.slice(0, 6));
        }
    } catch (error) {
        console.error('Error loading related movies:', error);
        relatedMovies.innerHTML = '<div class="movie-card-placeholder"><div class="placeholder-content"><i class="fas fa-film"></i><p>Related movies not available</p></div></div>';
    }
}

// Render related movies
function renderRelatedMovies(movies) {
    relatedMovies.innerHTML = '';
    
    if (movies.length === 0) {
        relatedMovies.innerHTML = '<div class="movie-card-placeholder"><div class="placeholder-content"><i class="fas fa-film"></i><p>No related movies found</p></div></div>';
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.onclick = () => {
            window.location.href = `/pages/client/detailed/detailed.html?id=${movie._id}`;
        };

        const img = document.createElement('img');
        img.src = movie.cover || '/assets/icons/title-movie.svg';
        img.alt = movie.title;
        img.onerror = () => {
            img.src = '/assets/icons/title-movie.svg';
        };

        const info = document.createElement('div');
        info.className = 'movie-info';

        const movieTitle = document.createElement('h3');
        movieTitle.textContent = movie.title;

        const movieMeta = document.createElement('p');
        movieMeta.className = 'movie-meta';
        movieMeta.innerHTML = `
            ${movie.imdb ? `<span class="imdb">★ ${movie.imdb}</span>` : ''}
            ${movie.runTimeMin ? `<span>${movie.runTimeMin} min</span>` : ''}
        `;

        info.appendChild(movieTitle);
        info.appendChild(movieMeta);

        movieCard.appendChild(img);
        movieCard.appendChild(info);
        relatedMovies.appendChild(movieCard);
    });
}

// Toggle favorite status
async function toggleFavorite() {
    try {
        const response = await fetch(`${API_BASE}/favorite/${isFavorite ? 'remove' : 'add'}/${movieId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            isFavorite = !isFavorite;
            updateFavoriteButton();
            showToast(
                isFavorite ? 'Added to favorites!' : 'Removed from favorites!',
                'success'
            );
        } else {
            throw new Error('Failed to update favorite status');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showToast('Failed to update favorites. Please try again.', 'error');
    }
}

// Update favorite button appearance
function updateFavoriteButton() {
    const btnFavorite = document.getElementById('btn-favorite');
    const quickFavorite = document.getElementById('quick-favorite');
    
    if (isFavorite) {
        btnFavorite.innerHTML = '<i class="fas fa-heart"></i> Remove from List';
        btnFavorite.classList.add('active');
        quickFavorite.innerHTML = '<i class="fas fa-heart"></i><span>Remove from Favorites</span>';
    } else {
        btnFavorite.innerHTML = '<i class="far fa-heart"></i> Add to List';
        btnFavorite.classList.remove('active');
        quickFavorite.innerHTML = '<i class="far fa-heart"></i><span>Add to Favorites</span>';
    }
}

// Share movie
function shareMovie() {
    if (navigator.share) {
        navigator.share({
            title: currentMovie.title,
            text: currentMovie.overview,
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }
}

// Add to watchlist
function addToWatchlist() {
    // This would require a watchlist API endpoint
    showToast('Watchlist feature coming soon!', 'info');
}

// Show trailer modal
function showTrailer(trailerUrl) {
    if (trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be')) {
        const videoId = extractYouTubeId(trailerUrl);
        if (videoId) {
            trailerContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            `;
        } else {
            trailerContainer.innerHTML = '<p>Invalid YouTube URL</p>';
        }
    } else {
        trailerContainer.innerHTML = '<p>Trailer format not supported</p>';
    }
    
    trailerModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close trailer modal
function closeTrailerModal() {
    trailerModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    trailerContainer.innerHTML = '<p>Trailer not available</p>';
}

// Extract YouTube video ID
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Show loading state
function showLoading() {
    loadingSpinner.style.display = 'flex';
    errorMessage.style.display = 'none';
    movieDetailContent.style.display = 'none';
}

// Hide loading state
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show error state
function showError(message) {
    errorMessage.style.display = 'flex';
    loadingSpinner.style.display = 'none';
    movieDetailContent.style.display = 'none';
}

// Show content
function showContent() {
    movieDetailContent.style.display = 'block';
    loadingSpinner.style.display = 'none';
    errorMessage.style.display = 'none';
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

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause any playing media when page is hidden
        const iframe = trailerContainer.querySelector('iframe');
        if (iframe) {
            const iframeSrc = iframe.src;
            iframe.src = '';
            iframe.src = iframeSrc;
        }
    }
});
