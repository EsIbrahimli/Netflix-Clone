const tableBody = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');
const createBtn = document.getElementById('create-btn');
const moviesModal = document.querySelector('.movies-modal');
const moviesEditModal = document.querySelector('.movies-edit-modal');
const moviesDeleteModal = document.querySelector('.movies-delete-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const deleteMovieBtn = document.getElementById('delete-movie-btn');
const cancelMovieBtn = document.getElementById('cancel-movie-btn');
//Token
const token = localStorage.getItem('token');

let currentPage = 1;
const itemsPerPage = 8;
let allMovies = [];
let allCategories = [];
let allActors = [];
let selectedActors = [];
let selectedCategory = null;
let editSelectedActors = [];
let editSelectedCategory = null;

// API Functions
async function getCategories() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/categories`;
    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching categories:', error);
    }
}

async function getActors() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors`;
    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error fetching actors:', error);
    }
}

async function getMovies() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movies`;
    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
        Toastify({
            text: "Xəta baş verdi!",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
            stopOnFocus: true,
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    }
}

async function getMovieById(id) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movie/${id}`;
    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
    }
}

async function deleteMovieById(id) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movie/${id}`;
    const options = {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

async function createMovie(newMovie) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movie`;
    const options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newMovie)
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

async function updateMovieById(id, updatedMovie) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movie/${id}`;
    const options = {
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedMovie)
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
        throw error;
    }
}

// Setup Dropdowns
function setupCategoryDropdown(isEdit = false) {
    const prefix = isEdit ? 'edit-' : '';
    const dropdownContainer = document.querySelector(`.${prefix}category-dropdown`);
    const selectedOption = dropdownContainer.querySelector('.selected-option');
    const optionsContainer = dropdownContainer.querySelector('.options');

    // Clear previous content
    optionsContainer.innerHTML = '';

    // Add categories
    allCategories.forEach(category => {
        const option = document.createElement('div');
        option.className = 'option';
        option.textContent = category.name;
        option.dataset.id = category.id;
        
        option.addEventListener('click', () => {
            if (isEdit) {
                editSelectedCategory = category.id;
            } else {
                selectedCategory = category.id;
            }
            selectedOption.innerHTML = `${category.name} <i class="fa-solid fa-chevron-down"></i>`;
            dropdownContainer.classList.remove('active');
        });
        
        optionsContainer.appendChild(option);
    });

    // Toggle dropdown
    selectedOption.onclick = (e) => {
        e.stopPropagation();
        dropdownContainer.classList.toggle('active');
        // Close other dropdowns
        document.querySelectorAll(`.${prefix}actors-dropdown`).forEach(d => d.classList.remove('active'));
    };
}

function setupActorsDropdown(isEdit = false) {
    const prefix = isEdit ? 'edit-' : '';
    const dropdownContainer = document.querySelector(`.${prefix}actors-dropdown`);
    const selectedOption = dropdownContainer.querySelector('.selected-option');
    const optionsContainer = dropdownContainer.querySelector('.options');

    // Clear previous content
    optionsContainer.innerHTML = '';

    // Add actors
    allActors.forEach(actor => {
        const option = document.createElement('div');
        option.className = 'option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${prefix}actor-${actor.id}`;
        checkbox.value = actor.id;
        
        const label = document.createElement('label');
        label.htmlFor = `${prefix}actor-${actor.id}`;
        label.textContent = `${actor.name} ${actor.surname}`;
        
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            const actorId = parseInt(checkbox.value);
            
            if (isEdit) {
                if (checkbox.checked) {
                    if (!editSelectedActors.includes(actorId)) {
                        editSelectedActors.push(actorId);
                    }
                } else {
                    editSelectedActors = editSelectedActors.filter(id => id !== actorId);
                }
                updateSelectedActorsDisplay(true);
            } else {
                if (checkbox.checked) {
                    if (!selectedActors.includes(actorId)) {
                        selectedActors.push(actorId);
                    }
                } else {
                    selectedActors = selectedActors.filter(id => id !== actorId);
                }
                updateSelectedActorsDisplay(false);
            }
        });
        
        option.appendChild(checkbox);
        option.appendChild(label);
        optionsContainer.appendChild(option);
    });

    // Toggle dropdown
    selectedOption.onclick = (e) => {
        e.stopPropagation();
        dropdownContainer.classList.toggle('active');
        // Close other dropdowns
        document.querySelectorAll(`.${prefix}category-dropdown`).forEach(d => d.classList.remove('active'));
    };
}

function updateSelectedActorsDisplay(isEdit = false) {
    const prefix = isEdit ? 'edit-' : '';
    const selectedOption = document.querySelector(`.${prefix}actors-dropdown .selected-option`);
    const actors = isEdit ? editSelectedActors : selectedActors;
    
    if (actors.length > 0) {
        const actorNames = actors.map(id => {
            const actor = allActors.find(a => a.id === id);
            return actor ? `${actor.name} ${actor.surname}` : '';
        }).filter(name => name !== '');
        
        selectedOption.innerHTML = `${actorNames.join(', ')} <i class="fa-solid fa-chevron-down"></i>`;
    } else {
        selectedOption.innerHTML = `actors <i class="fa-solid fa-chevron-down"></i>`;
    }
}

async function loadDropdownData() {
    const categoriesData = await getCategories();
    const actorsData = await getActors();
    
    if (categoriesData && categoriesData.data) {
        allCategories = categoriesData.data;
    }
    
    if (actorsData && actorsData.data) {
        allActors = actorsData.data;
    }

    // Setup dropdowns for both modals
    setupCategoryDropdown(false); // Create modal
    setupActorsDropdown(false);   // Create modal
    setupCategoryDropdown(true);  // Edit modal
    setupActorsDropdown(true);    // Edit modal
}

// Render Functions
async function renderMovies() {
    const moviesData = await getMovies();
    allMovies = moviesData.data;
    showPage(currentPage);
    renderPagination();
}

function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const moviesToShow = allMovies.slice(start, end);

    tableBody.innerHTML = moviesToShow.map(movie => `
        <tr>
            <td>${movie.id}</td>
            <td><img class="movie-icon" src="${movie.cover_url}" alt=""> </td>
            <td>${movie.title}</td>
            <td>${movie.overview}</td>
            <td>${movie.category?.name || 'No category'}</td>
            <td>${movie.imdb}</td>
           <td>
               <button class="edit-btn" onclick="window.openEditModal(${movie.id})"><i class="fa-solid fa-pen"></i></button>
            </td>
           <td>
              <button class="delete-btn" onclick="window.openDeleteModal(${movie.id})"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
    `).join('');
}

function renderPagination() {
  const totalPages = Math.ceil(allMovies.length / itemsPerPage);
  const pagination = document.querySelector('.pagination');
  let html = '';

    const visiblePages = 3;
  let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  let endPage = Math.min(totalPages, startPage + visiblePages - 1);

  if (endPage - startPage < visiblePages - 1) {
    startPage = Math.max(1, endPage - visiblePages + 1);
  }

  html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
    </li>
  `;

  for (let i = startPage; i <= endPage; i++) {
    html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
    </li>
  `;

  pagination.innerHTML = html;

  const links = pagination.querySelectorAll('.page-link');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = Number(e.target.dataset.page);
      if (page >= 1 && page <= totalPages) {
        currentPage = page;
        showPage(currentPage);
        renderPagination();
      }
    });
  });
}

// Modal Functions - Make them global so onclick can access them
window.openEditModal = async function(movieId) {
    console.log('Opening edit modal for movie:', movieId);
    try {
        const movieData = await getMovieById(movieId);
        console.log('Movie data received:', movieData);
        const movie = movieData.data;

        // Fill form fields
        document.getElementById('edit-input-title').value = movie.title || '';
        document.getElementById('edit-input-overview').value = movie.overview || '';
        document.getElementById('edit-input-cover').value = movie.cover_url || '';
        document.getElementById('edit-input-fragman').value = movie.fragman_url || '';
        document.getElementById('edit-input-watch').value = movie.watch_url || '';
        document.getElementById('edit-input-imdb').value = movie.imdb || '';
        document.getElementById('edit-input-runTimeMin').value = movie.run_time_min || '';
        document.getElementById('edit-sex').checked = movie.is_adult || false;
        
        console.log('Form fields filled successfully');

        // Update the image preview
        const editImage = document.querySelector('.modal-edit-image');
        if (movie.cover_url) {
            editImage.src = movie.cover_url;
        } else {
            editImage.src = '/assets/icons/modal-img.svg';
        }

        // Reset and set selected actors first
        editSelectedActors = movie.actors ? movie.actors.map(actor => actor.id) : [];
        
        // Reset and set selected category
        if (movie.category) {
            editSelectedCategory = movie.category.id;
        } else {
            editSelectedCategory = null;
        }

        // Re-setup dropdowns to ensure they're fresh
        setupCategoryDropdown(true);
        setupActorsDropdown(true);

        // Now set the display values and check checkboxes
        if (movie.category) {
            document.querySelector('.edit-category-dropdown .selected-option').innerHTML = 
                `${movie.category.name} <i class="fa-solid fa-chevron-down"></i>`;
        } else {
            document.querySelector('.edit-category-dropdown .selected-option').innerHTML = 
                `category <i class="fa-solid fa-chevron-down"></i>`;
        }
        
        // Check the selected actors in checkboxes
        if (movie.actors && movie.actors.length > 0) {
            // Small delay to ensure checkboxes are rendered
            setTimeout(() => {
                movie.actors.forEach(actor => {
                    const checkbox = document.getElementById(`edit-actor-${actor.id}`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
                updateSelectedActorsDisplay(true);
            }, 10);
        } else {
            document.querySelector('.edit-actors-dropdown .selected-option').innerHTML = 
                `actors <i class="fa-solid fa-chevron-down"></i>`;
        }

        localStorage.setItem('movieId', JSON.stringify(movieId));
        moviesEditModal.style.display = 'flex';
        modalOverlay.classList.add('active');
    } catch (error) {
        console.error('Error opening edit modal:', error);
        Toastify({
            text: "Film məlumatları yüklənərkən xəta baş verdi!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    }
}

window.openDeleteModal = function(movieId) {
    localStorage.setItem('movieId', JSON.stringify(movieId));
    moviesDeleteModal.style.display = 'flex';
    modalOverlay.classList.add('active');
}

// Event Listeners
createBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Reset form
    document.getElementById('input-title').value = '';
    document.getElementById('input-overview').value = '';
    document.getElementById('input-cover').value = '';
    document.getElementById('input-fragman').value = '';
    document.getElementById('input-watch').value = '';
    document.getElementById('input-imdb').value = '';
    document.getElementById('input-runTimeMin').value = '';
    document.getElementById('sex').checked = false;
    document.querySelector('.modal-image').src = '/assets/icons/modal-img.svg';
    
    // Reset selections
    selectedActors = [];
    selectedCategory = null;
    
    // Reset displays
    document.querySelector('.category-dropdown .selected-option').innerHTML = 
        `category <i class="fa-solid fa-chevron-down"></i>`;
    document.querySelector('.actors-dropdown .selected-option').innerHTML = 
        `actors <i class="fa-solid fa-chevron-down"></i>`;
    
    // Uncheck all actor checkboxes
    document.querySelectorAll('.actors-dropdown input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    moviesModal.style.display = 'flex';
    modalOverlay.classList.add('active');
});

// Close modal when clicking on overlay
modalOverlay.addEventListener('click', () => {
    moviesModal.style.display = 'none';
    moviesEditModal.style.display = 'none';
    moviesDeleteModal.style.display = 'none';
    modalOverlay.classList.remove('active');
    
    // Close all dropdowns
    document.querySelectorAll('.category-dropdown, .actors-dropdown, .edit-category-dropdown, .edit-actors-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
});

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
    const dropdowns = document.querySelectorAll('.category-dropdown, .actors-dropdown, .edit-category-dropdown, .edit-actors-dropdown');
    dropdowns.forEach(dropdown => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
});

moviesModal.addEventListener('click', (e) => {
    e.stopPropagation();
});

moviesEditModal.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Image URL Preview for Create Modal
const coverInput = document.getElementById('input-cover');
const modalImage = document.querySelector('.modal-image');

coverInput.addEventListener('input', (e) => {
    const imageUrl = e.target.value.trim();
    
    if (imageUrl && imageUrl.startsWith('http')) {
        modalImage.src = imageUrl;
        modalImage.onerror = () => {
            modalImage.src = '/assets/icons/modal-img.svg';
        };
    } else if (imageUrl === '') {
        modalImage.src = '/assets/icons/modal-img.svg';
    }
});

// Image URL Preview for Edit Modal
const editCoverInput = document.getElementById('edit-input-cover');
const editModalImage = document.querySelector('.modal-edit-image');

editCoverInput.addEventListener('input', (e) => {
    const imageUrl = e.target.value.trim();
    
    if (imageUrl && imageUrl.startsWith('http')) {
        editModalImage.src = imageUrl;
        editModalImage.onerror = () => {
            editModalImage.src = '/assets/icons/modal-img.svg';
        };
    } else if (imageUrl === '') {
        editModalImage.src = '/assets/icons/modal-img.svg';
    }
});

// Create button handler
const btnSubmit = document.getElementById('btn-submit');
btnSubmit.addEventListener('click', async () => {
    try {
        const newMovie = {
            title: document.getElementById('input-title').value.trim(),
            overview: document.getElementById('input-overview').value.trim(),
            cover_url: document.getElementById('input-cover').value.trim(),
            fragman_url: document.getElementById('input-fragman').value.trim(),
            watch_url: document.getElementById('input-watch').value.trim(),
            imdb: document.getElementById('input-imdb').value.trim(),
            run_time_min: document.getElementById('input-runTimeMin').value.trim(),
            is_adult: document.getElementById('sex').checked,
            category_id: selectedCategory,
            actor_ids: selectedActors
        };

        if (!newMovie.title || !newMovie.overview) {
            Toastify({
                text: "Zəhmət olmasa başlıq və açıqlama daxil edin!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#a72a28ff",
                stopOnFocus: true,
                style: {
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    fontSize: "15px",
                    fontWeight: "500",
                    padding: "12px 18px"
                },
            }).showToast();
            return;
        }

        await createMovie(newMovie);
        await renderMovies();
        
        moviesModal.style.display = 'none';
        modalOverlay.classList.remove('active');

        Toastify({
            text: "Film uğurla əlavə edildi ✅",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#28a745",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    } catch (error) {
        console.error('Error creating movie:', error);
        Toastify({
            text: "Film əlavə edilərkən xəta baş verdi!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    }
});

// Edit button handler
const btnEditSubmit = document.getElementById('btn-edit-submit');
btnEditSubmit.addEventListener('click', async () => {
    try {
        const movieId = JSON.parse(localStorage.getItem('movieId'));
        
        const updatedMovie = {
            title: document.getElementById('edit-input-title').value.trim(),
            overview: document.getElementById('edit-input-overview').value.trim(),
            cover_url: document.getElementById('edit-input-cover').value.trim(),
            fragman_url: document.getElementById('edit-input-fragman').value.trim(),
            watch_url: document.getElementById('edit-input-watch').value.trim(),
            imdb: document.getElementById('edit-input-imdb').value.trim(),
            run_time_min: document.getElementById('edit-input-runTimeMin').value.trim(),
            is_adult: document.getElementById('edit-sex').checked,
            category_id: editSelectedCategory,
            actor_ids: editSelectedActors
        };

        if (!updatedMovie.title || !updatedMovie.overview) {
            Toastify({
                text: "Zəhmət olmasa başlıq və açıqlama daxil edin!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: "#a72a28ff",
                stopOnFocus: true,
                style: {
                    borderRadius: "10px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    fontSize: "15px",
                    fontWeight: "500",
                    padding: "12px 18px"
                },
            }).showToast();
            return;
        }

        await updateMovieById(movieId, updatedMovie);
        await renderMovies();
        
        moviesEditModal.style.display = 'none';
        modalOverlay.classList.remove('active');

        Toastify({
            text: "Film uğurla yeniləndi ✅",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#28a745",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    } catch (error) {
        console.error('Error updating movie:', error);
        Toastify({
            text: "Film yenilənərkən xəta baş verdi!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    }
});

// Delete button handlers
deleteMovieBtn.addEventListener('click', async () => {
    try {
        const movieId = JSON.parse(localStorage.getItem('movieId'));
        await deleteMovieById(movieId);
        await renderMovies();
        
        moviesDeleteModal.style.display = 'none';
        modalOverlay.classList.remove('active');

        Toastify({
            text: "Film uğurla silindi ✅",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#28a745",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    } catch (error) {
        console.error('Error deleting movie:', error);
        Toastify({
            text: "Film silinərkən xəta baş verdi!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
            style: {
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                fontSize: "15px",
                fontWeight: "500",
                padding: "12px 18px"
            },
        }).showToast();
    }
});

cancelMovieBtn.addEventListener('click', () => {
    moviesDeleteModal.style.display = 'none';
    modalOverlay.classList.remove('active');
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/pages/admin/login/login.html';
});// Initialize
async function init() {
    await loadDropdownData();
    await renderMovies();
}

init();


