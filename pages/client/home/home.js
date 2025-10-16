const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
const token = localStorage.getItem('token');

// Check auth
if (!token) {
    window.location.href = '/pages/client/login/login.html';
}

let allMovies = [];
let categories = [];

// Load initial data
window.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadCategories();
    await loadMovies();
});

// Setup event listeners
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
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

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (profileMenu) {
                profileMenu.classList.remove('active');
            }
        }
    });
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/category`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.data) {
            categories = data.data;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load all movies
async function loadMovies() {
    try {
        const response = await fetch(`${API_BASE}/movie`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            allMovies = data.data;
            // Shuffle movies for variety in hero banner
            const shuffledMovies = [...allMovies].sort(() => Math.random() - 0.5);
            displayHeroBanner(shuffledMovies[0]);
            displayMoviesByCategory();
        } else {
            // Show placeholder content if no movies
            showNoMoviesMessage();
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        showErrorMessage();
    }
}

// Show no movies message
function showNoMoviesMessage() {
    const contentRows = document.getElementById('content-rows');
    contentRows.innerHTML = `
        <div class="no-content">
            <i class="fas fa-film"></i>
            <h2>No Movies Available</h2>
            <p>Check back later for new content!</p>
        </div>
    `;
}

// Show error message
function showErrorMessage() {
    const contentRows = document.getElementById('content-rows');
    contentRows.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <h2>Unable to Load Movies</h2>
            <p>Please check your connection and try again.</p>
            <button onclick="location.reload()" class="btn-retry">Try Again</button>
        </div>
    `;
}

// Display hero banner
function displayHeroBanner(movie) {
    const heroBanner = document.getElementById('hero-banner');
    const heroTitle = document.getElementById('hero-title');
    const heroDescription = document.getElementById('hero-description');
    const heroPlay = document.getElementById('hero-play');
    const heroInfo = document.getElementById('hero-info');

    if (movie.cover) {
        heroBanner.style.backgroundImage = `url(${movie.cover})`;
    }

    heroTitle.textContent = movie.title;
    heroDescription.textContent = movie.overview || 'No description available';

    heroPlay.onclick = () => {
        if (movie.watch) {
            window.open(movie.watch, '_blank');
        } else {
            window.location.href = `/pages/client/detailed/detailed.html?id=${movie._id}`;
        }
    };

    heroInfo.onclick = () => {
        window.location.href = `/pages/client/detailed/detailed.html?id=${movie._id}`;
    };
}

// Display movies by category
function displayMoviesByCategory() {
    const contentRows = document.getElementById('content-rows');
    contentRows.innerHTML = '';

    // Group movies by category
    categories.forEach(category => {
        const categoryMovies = allMovies.filter(movie => 
            movie.category && movie.category._id === category._id
        );

        if (categoryMovies.length > 0) {
            const row = createMovieRow(category.name, categoryMovies);
            contentRows.appendChild(row);
        }
    });

    // Add "All Movies" row
    if (allMovies.length > 0) {
        const allRow = createMovieRow('All Movies', allMovies);
        contentRows.appendChild(allRow);
    }
}

// Create movie row
function createMovieRow(title, movies) {
    const row = document.createElement('div');
    row.className = 'movie-row';

    const rowTitle = document.createElement('h2');
    rowTitle.className = 'row-title';
    rowTitle.textContent = title;

    const movieList = document.createElement('div');
    movieList.className = 'movie-list';

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
        movieList.appendChild(movieCard);
    });

    // Add scroll buttons
    const btnLeft = document.createElement('button');
    btnLeft.className = 'scroll-btn left';
    btnLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';
    btnLeft.onclick = () => scrollMovieList(movieList, -1);

    const btnRight = document.createElement('button');
    btnRight.className = 'scroll-btn right';
    btnRight.innerHTML = '<i class="fas fa-chevron-right"></i>';
    btnRight.onclick = () => scrollMovieList(movieList, 1);

    row.appendChild(rowTitle);
    row.appendChild(btnLeft);
    row.appendChild(movieList);
    row.appendChild(btnRight);

    return row;
}

// Scroll movie list
function scrollMovieList(list, direction) {
    const scrollAmount = 300;
    list.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// Handle offline/online events
window.addEventListener('online', () => {
    console.log('Connection restored');
    // Reload movies when connection is restored
    if (allMovies.length === 0) {
        loadMovies();
    }
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
});

// Add some performance optimizations
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttled scroll handler
const throttledScrollHandler = throttle(() => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}, 100);

// Replace the scroll event listener
window.removeEventListener('scroll', () => {});
window.addEventListener('scroll', throttledScrollHandler);
