const actorTable = document.querySelector('.body-table');
const createBtn = document.querySelector('#create-btn');
const actorsModal = document.querySelector('.actors-modal');
const addActorBtn = document.querySelector('#add-actor-btn');
const logoutBtn = document.querySelector('.logout');

// Input fields
const actorNameInput = document.querySelector('#actor-name-input');
const actorSurnameInput = document.querySelector('#actor-surname-input');
const actorImgInput = document.querySelector('#actor-img-input');

const token = localStorage.getItem('token');
let currentActorId = null;
let isEditMode = false;

const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load actors on page load
window.addEventListener('DOMContentLoaded', () => {
    loadActors();
});

// Load all actors
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
            renderActors(data.data);
        } else {
            actorTable.innerHTML = '<tr><td colspan="6" style="text-align:center">No actors found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading actors:', error);
        actorTable.innerHTML = '<tr><td colspan="6" style="text-align:center">Error loading actors</td></tr>';
    }
}

// Render actors to table
function renderActors(actors) {
    actorTable.innerHTML = '';
    actors.forEach((actor, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><img class="movie-icon" src="${actor.image || '/assets/icons/profile-img.svg'}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:50%;"></td>
            <td>${actor.name || 'N/A'}</td>
            <td>${actor.surname || 'N/A'}</td>
            <td>
                <button class="edit-btn" data-id="${actor._id}"><i class="fa-solid fa-pen"></i></button>
            </td>
            <td>
                <button class="delete-btn" data-id="${actor._id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        actorTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editActor(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteActor(btn.dataset.id));
    });
}

// Create button - open modal
createBtn.addEventListener('click', () => {
    isEditMode = false;
    currentActorId = null;
    clearForm();
    actorsModal.style.display = 'flex';
    addActorBtn.textContent = 'Create';
});

// Close modal when clicking outside
actorsModal.addEventListener('click', (e) => {
    if (e.target === actorsModal) {
        actorsModal.style.display = 'none';
    }
});

// Submit form - Create or Update
addActorBtn.addEventListener('click', async () => {
    const actorData = {
        name: actorNameInput.value.trim(),
        surname: actorSurnameInput.value.trim(),
        image: actorImgInput.value.trim()
    };
    
    // Validation
    if (!actorData.name || !actorData.surname) {
        alert('Please fill in name and surname');
        return;
    }
    
    try {
        let response;
        if (isEditMode && currentActorId) {
            // Update actor
            response = await fetch(`${API_BASE}/admin/actor/${currentActorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(actorData)
            });
        } else {
            // Create actor
            response = await fetch(`${API_BASE}/admin/actor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(actorData)
            });
        }
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (response.ok) {
            alert(isEditMode ? 'Actor updated successfully!' : 'Actor created successfully!');
            actorsModal.style.display = 'none';
            clearForm();
            loadActors();
        } else {
            alert('Error: ' + (data.message || 'Something went wrong'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving actor');
    }
});

// Edit actor
async function editActor(id) {
    try {
        const response = await fetch(`${API_BASE}/actor/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Actor details:', data);
        
        if (data.data) {
            const actor = data.data;
            
            // Fill form with actor data
            actorNameInput.value = actor.name || '';
            actorSurnameInput.value = actor.surname || '';
            actorImgInput.value = actor.image || '';
            
            isEditMode = true;
            currentActorId = id;
            addActorBtn.textContent = 'Update';
            actorsModal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading actor:', error);
        alert('Error loading actor details');
    }
}

// Delete actor
async function deleteActor(id) {
    if (!confirm('Are you sure you want to delete this actor?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/actor/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Actor deleted successfully!');
            loadActors();
        } else {
            alert('Error deleting actor: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting actor');
    }
}

// Clear form
function clearForm() {
    actorNameInput.value = '';
    actorSurnameInput.value = '';
    actorImgInput.value = '';
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});
