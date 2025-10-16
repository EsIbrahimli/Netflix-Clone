const movieTable = document.querySelector('.body-table');
const createBtn = document.querySelector('#create-btn');
const moviesModal = document.querySelector('.movies-modal');
const btnSubmit = document.querySelector('#btn-submit');
const logoutBtn = document.querySelector('.logout');

// Input fields
const inputTitle = document.querySelector('#input-title');
const inputOverview = document.querySelector('#input-overview');
const inputCover = document.querySelector('#input-cover');
const inputFragman = document.querySelector('#input-fragman');
const inputWatch = document.querySelector('#input-watch');
const inputImdb = document.querySelector('#input-imdb');
const inputRunTime = document.querySelector('#input-runTimeMin');
const inputAdult = document.querySelector('#sex');

// Dropdowns
const actorsDropdown = document.querySelector('.actors-dropdown');
const categoryDropdown = document.querySelector('.category-dropdown');

const token = localStorage.getItem('token');
let currentMovieId = null;
let isEditMode = false;
let selectedActors = [];
let selectedCategory = null;

// API Base URL
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load movies on page load
window.addEventListener('DOMContentLoaded', () => {
    loadMovies();
    loadCategories();
    loadActors();
});

// Load all movies
async function loadMovies() {
    try {
        const response = await fetch(`${API_BASE}/movie`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Movies:', data);
        
        if (data.data && data.data.length > 0) {
            renderMovies(data.data);
        } else {
            movieTable.innerHTML = '<tr><td colspan="7" style="text-align:center">No movies found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        movieTable.innerHTML = '<tr><td colspan="7" style="text-align:center">Error loading movies</td></tr>';
    }
}

// Render movies to table
function renderMovies(movies) {
    movieTable.innerHTML = '';
    movies.forEach((movie, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img class="movie-icon" src="${movie.cover || '/assets/icons/title-movie.svg'}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;">${movie.title}</td>
            <td>${movie.overview ? movie.overview.substring(0, 50) + '...' : 'No description'}</td>
            <td>${movie.category ? movie.category.name : 'N/A'}</td>
            <td>${movie.imdb || 'N/A'}</td>
            <td>
                <button class="edit-btn" data-id="${movie._id}"><i class="fa-solid fa-pen"></i></button>
            </td>
            <td>
                <button class="delete-btn" data-id="${movie._id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        movieTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editMovie(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
    });
}

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/category`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Categories:', data);
        
        if (data.data && data.data.length > 0) {
            renderCategoryDropdown(data.data);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render category dropdown
function renderCategoryDropdown(categories) {
    const optionsContainer = categoryDropdown.querySelector('.options');
    optionsContainer.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('div');
        option.className = 'option';
        option.textContent = category.name;
        option.dataset.id = category._id;
        option.addEventListener('click', () => {
            selectedCategory = category._id;
            categoryDropdown.querySelector('.selected-option').innerHTML = `${category.name} <i class="fa-solid fa-chevron-down"></i>`;
            optionsContainer.style.display = 'none';
        });
        optionsContainer.appendChild(option);
    });
}

// Load actors for dropdown
async function loadActors() {
    try {
        const response = await fetch(`${API_BASE}/actor`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Actors:', data);
        
        if (data.data && data.data.length > 0) {
            renderActorsDropdown(data.data);
        }
    } catch (error) {
        console.error('Error loading actors:', error);
    }
}

// Render actors dropdown
function renderActorsDropdown(actors) {
    const optionsContainer = actorsDropdown.querySelector('.options');
    optionsContainer.innerHTML = '';
    
    actors.forEach(actor => {
        const option = document.createElement('div');
        option.className = 'option';
        option.innerHTML = `<input type="checkbox" data-id="${actor._id}"> ${actor.name}`;
        
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedActors.push(actor._id);
            } else {
                selectedActors = selectedActors.filter(id => id !== actor._id);
            }
            updateActorsDisplay();
        });
        
        optionsContainer.appendChild(option);
    });
}

function updateActorsDisplay() {
    const count = selectedActors.length;
    actorsDropdown.querySelector('.selected-option').innerHTML = `${count} actor${count !== 1 ? 's' : ''} selected <i class="fa-solid fa-chevron-down"></i>`;
}

// Toggle category dropdown
categoryDropdown.querySelector('.selected-option').addEventListener('click', () => {
    const options = categoryDropdown.querySelector('.options');
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
});

// Toggle actors dropdown
actorsDropdown.querySelector('.selected-option').addEventListener('click', () => {
    const options = actorsDropdown.querySelector('.options');
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
});

// Create button - open modal
createBtn.addEventListener('click', () => {
    isEditMode = false;
    currentMovieId = null;
    clearForm();
    moviesModal.style.display = 'flex';
    btnSubmit.textContent = 'Create';
});

// Close modal when clicking outside
moviesModal.addEventListener('click', (e) => {
    if (e.target === moviesModal) {
        moviesModal.style.display = 'none';
    }
});

// Submit form - Create or Update
btnSubmit.addEventListener('click', async () => {
    const movieData = {
        title: inputTitle.value.trim(),
        overview: inputOverview.value.trim(),
        cover: inputCover.value.trim(),
        fragman: inputFragman.value.trim(),
        watch: inputWatch.value.trim(),
        imdb: parseFloat(inputImdb.value) || 0,
        runTimeMin: parseInt(inputRunTime.value) || 0,
        adult: inputAdult.checked,
        category: selectedCategory,
        actors: selectedActors
    };
    
    // Validation
    if (!movieData.title || !movieData.overview) {
        alert('Please fill in title and overview');
        return;
    }
    
    if (!movieData.category) {
        alert('Please select a category');
        return;
    }
    
    try {
        let response;
        if (isEditMode && currentMovieId) {
            // Update movie
            response = await fetch(`${API_BASE}/admin/movie/${currentMovieId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(movieData)
            });
        } else {
            // Create movie
            response = await fetch(`${API_BASE}/admin/movie`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(movieData)
            });
        }
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (response.ok) {
            alert(isEditMode ? 'Movie updated successfully!' : 'Movie created successfully!');
            moviesModal.style.display = 'none';
            clearForm();
            loadMovies();
        } else {
            alert('Error: ' + (data.message || 'Something went wrong'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving movie');
    }
});

// Edit movie
async function editMovie(id) {
    try {
        const response = await fetch(`${API_BASE}/movie/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Movie details:', data);
        
        if (data.data) {
            const movie = data.data;
            
            // Fill form with movie data
            inputTitle.value = movie.title || '';
            inputOverview.value = movie.overview || '';
            inputCover.value = movie.cover || '';
            inputFragman.value = movie.fragman || '';
            inputWatch.value = movie.watch || '';
            inputImdb.value = movie.imdb || '';
            inputRunTime.value = movie.runTimeMin || '';
            inputAdult.checked = movie.adult || false;
            
            // Set category
            if (movie.category) {
                selectedCategory = movie.category._id;
                categoryDropdown.querySelector('.selected-option').innerHTML = `${movie.category.name} <i class="fa-solid fa-chevron-down"></i>`;
            }
            
            // Set actors
            selectedActors = movie.actors ? movie.actors.map(actor => actor._id) : [];
            updateActorsDisplay();
            
            // Update checkboxes
            document.querySelectorAll('.actors-dropdown input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = selectedActors.includes(checkbox.dataset.id);
            });
            
            isEditMode = true;
            currentMovieId = id;
            btnSubmit.textContent = 'Update';
            moviesModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading movie:', error);
        alert('Error loading movie details');
    }
}

// Delete movie
async function deleteMovie(id) {
    if (!confirm('Are you sure you want to delete this movie?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/movie/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Movie deleted successfully!');
            loadMovies();
        } else {
            alert('Error deleting movie: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting movie');
    }
}

// Clear form
function clearForm() {
    inputTitle.value = '';
    inputOverview.value = '';
    inputCover.value = '';
    inputFragman.value = '';
    inputWatch.value = '';
    inputImdb.value = '';
    inputRunTime.value = '';
    inputAdult.checked = false;
    selectedCategory = null;
    selectedActors = [];
    categoryDropdown.querySelector('.selected-option').innerHTML = 'category <i class="fa-solid fa-chevron-down"></i>';
    actorsDropdown.querySelector('.selected-option').innerHTML = 'actors <i class="fa-solid fa-chevron-down"></i>';
    
    // Uncheck all actor checkboxes
    document.querySelectorAll('.actors-dropdown input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});
