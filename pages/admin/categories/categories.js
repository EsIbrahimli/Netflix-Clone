const categoryTable = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');
const createCategoryBtn = document.getElementById('create-category-btn');
const categoryModal = document.getElementById('category-modal');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const categoryForm = document.getElementById('category-form');
const categoryNameInput = document.getElementById('category-name');
const categoryDescriptionInput = document.getElementById('category-description');
const saveBtn = document.getElementById('save-btn');
const modalTitle = document.getElementById('modal-title');

const token = localStorage.getItem('token');
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
let currentCategoryId = null;
let isEditMode = false;

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load categories on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Create category button
    createCategoryBtn.addEventListener('click', openCreateModal);
    
    // Modal controls
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Form submission
    categoryForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal on outside click
    categoryModal.addEventListener('click', (e) => {
        if (e.target === categoryModal) {
            closeModal();
        }
    });
}

// Open create modal
function openCreateModal() {
    isEditMode = false;
    currentCategoryId = null;
    modalTitle.textContent = 'Create Category';
    saveBtn.textContent = 'Save Category';
    categoryForm.reset();
    categoryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    categoryModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    categoryForm.reset();
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        name: categoryNameInput.value.trim(),
        description: categoryDescriptionInput.value.trim()
    };
    
    // Validation
    if (!categoryData.name) {
        alert('Please enter a category name');
        return;
    }
    
    try {
        let response;
        if (isEditMode && currentCategoryId) {
            // Update category
            response = await fetch(`${API_BASE}/admin/category/${currentCategoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });
        } else {
            // Create category
            response = await fetch(`${API_BASE}/admin/category`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(categoryData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            alert(isEditMode ? 'Category updated successfully!' : 'Category created successfully!');
            closeModal();
            loadCategories();
        } else {
            alert('Error: ' + (data.message || 'Something went wrong'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving category');
    }
}

// Load all categories
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
            renderCategories(data.data);
        } else {
            categoryTable.innerHTML = '<tr><td colspan="4" style="text-align:center">No categories found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categoryTable.innerHTML = '<tr><td colspan="4" style="text-align:center">Error loading categories</td></tr>';
    }
}

// Render categories to table
function renderCategories(categories) {
    categoryTable.innerHTML = '';
    categories.forEach((category, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${category.name}</td>
            <td>
                <button class="edit-btn" data-id="${category._id}" data-name="${category.name}"><i class="fa-solid fa-pen"></i></button>
            </td>
            <td>
                <button class="delete-btn" data-id="${category._id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        categoryTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.id, btn.dataset.name));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
    });
}

// Edit category
async function editCategory(id, currentName) {
    isEditMode = true;
    currentCategoryId = id;
    modalTitle.textContent = 'Edit Category';
    saveBtn.textContent = 'Update Category';
    
    // Fill form with current data
    categoryNameInput.value = currentName;
    
    categoryModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/category/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Category deleted successfully!');
            loadCategories();
        } else {
            alert('Error deleting category: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting category');
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});
