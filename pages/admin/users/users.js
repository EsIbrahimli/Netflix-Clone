const userTable = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');
const createUserBtn = document.getElementById('create-user-btn');
const userModal = document.getElementById('user-modal');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const userForm = document.getElementById('user-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const saveBtn = document.getElementById('save-btn');
const modalTitle = document.getElementById('modal-title');

const token = localStorage.getItem('token');
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';
let currentUserId = null;
let isEditMode = false;

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load users on page load
window.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Create user button
    createUserBtn.addEventListener('click', openCreateModal);
    
    // Modal controls
    modalClose.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Form submission
    userForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal on outside click
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            closeModal();
        }
    });
}

// Open create modal
function openCreateModal() {
    isEditMode = false;
    currentUserId = null;
    modalTitle.textContent = 'Create User';
    saveBtn.textContent = 'Save User';
    userForm.reset();
    userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    userModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    userForm.reset();
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const userData = {
        username: usernameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
    };
    
    // Validation
    if (!userData.username || !userData.email || !userData.password) {
        showValidationError('Please fill in all fields');
        return;
    }

    // Username validation
    if (userData.username.length < 3) {
        showValidationError('Username must be at least 3 characters long');
        usernameInput.focus();
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
        showValidationError('Please enter a valid email address');
        emailInput.focus();
        return;
    }

    // Password validation
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
        showValidationError(passwordValidation.message);
        passwordInput.focus();
        return;
    }
    
    if (userData.password !== confirmPasswordInput.value) {
        showValidationError('Passwords do not match');
        passwordInput.style.borderColor = '#e50914';
        confirmPasswordInput.style.borderColor = '#e50914';
        setTimeout(() => {
            passwordInput.style.borderColor = '';
            confirmPasswordInput.style.borderColor = '';
        }, 3000);
        return;
    }
    
    try {
        let response;
        if (isEditMode && currentUserId) {
            // Update user
            response = await fetch(`${API_BASE}/admin/user/${currentUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Create user
            response = await fetch(`${API_BASE}/admin/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            alert(isEditMode ? 'User updated successfully!' : 'User created successfully!');
            closeModal();
            loadUsers();
        } else {
            alert('Error: ' + (data.message || 'Something went wrong'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error saving user');
    }
}

// Load all users
async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Users:', data);
        
        if (data.data && data.data.length > 0) {
            renderUsers(data.data);
        } else {
            userTable.innerHTML = '<tr><td colspan="3" style="text-align:center">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
        userTable.innerHTML = '<tr><td colspan="3" style="text-align:center">Error loading users</td></tr>';
    }
}

// Render users to table
function renderUsers(users) {
    userTable.innerHTML = '';
    users.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${user.username || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" data-id="${user._id}" data-username="${user.username}" data-email="${user.email}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="delete-btn" data-id="${user._id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        userTable.appendChild(row);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editUser(btn.dataset.id, btn.dataset.username, btn.dataset.email));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteUser(btn.dataset.id));
    });
}

// Edit user
function editUser(id, username, email) {
    isEditMode = true;
    currentUserId = id;
    modalTitle.textContent = 'Edit User';
    saveBtn.textContent = 'Update User';
    
    // Fill form with current data
    usernameInput.value = username;
    emailInput.value = email;
    passwordInput.value = '';
    confirmPasswordInput.value = '';
    
    userModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Delete user
async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/user/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('User deleted successfully!');
            loadUsers();
        } else {
            alert('Error deleting user: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting user');
    }
}

// Password validation function
function validatePassword(password) {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        return {
            isValid: false,
            message: `Password must be at least ${minLength} characters long`
        };
    }

    if (!hasLetter) {
        return {
            isValid: false,
            message: 'Password must contain at least one letter'
        };
    }

    if (!hasNumber) {
        return {
            isValid: false,
            message: 'Password must contain at least one number'
        };
    }

    if (!hasSpecialChar) {
        return {
            isValid: false,
            message: 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
        };
    }

    return {
        isValid: true,
        message: 'Password is valid'
    };
}

// Show validation error with better UX
function showValidationError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.validation-error');
    if (existingError) {
        existingError.remove();
    }

    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'validation-error';
    errorDiv.style.cssText = `
        background: #e50914;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        margin: 15px 0;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideDown 0.3s ease-out;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2000;
        max-width: 400px;
    `;
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; margin-left: auto; cursor: pointer;">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add to body
    document.body.appendChild(errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }
    }, 5000);
}

// Real-time password validation for admin users
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        updatePasswordRequirements(password);
    });
}

// Update password requirements visual feedback for admin
function updatePasswordRequirements(password) {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Update length requirement
    const reqLength = document.getElementById('req-length');
    if (reqLength) {
        if (password.length >= minLength) {
            reqLength.classList.remove('invalid');
            reqLength.classList.add('valid');
        } else {
            reqLength.classList.remove('valid');
            reqLength.classList.add('invalid');
        }
    }

    // Update letter requirement
    const reqLetter = document.getElementById('req-letter');
    if (reqLetter) {
        if (hasLetter) {
            reqLetter.classList.remove('invalid');
            reqLetter.classList.add('valid');
        } else {
            reqLetter.classList.remove('valid');
            reqLetter.classList.add('invalid');
        }
    }

    // Update number requirement
    const reqNumber = document.getElementById('req-number');
    if (reqNumber) {
        if (hasNumber) {
            reqNumber.classList.remove('invalid');
            reqNumber.classList.add('valid');
        } else {
            reqNumber.classList.remove('valid');
            reqNumber.classList.add('invalid');
        }
    }

    // Update special character requirement
    const reqSpecial = document.getElementById('req-special');
    if (reqSpecial) {
        if (hasSpecialChar) {
            reqSpecial.classList.remove('invalid');
            reqSpecial.classList.add('valid');
        } else {
            reqSpecial.classList.remove('valid');
            reqSpecial.classList.add('invalid');
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});
