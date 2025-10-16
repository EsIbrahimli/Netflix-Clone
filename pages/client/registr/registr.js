const registerForm = document.querySelector('#register-form');
const usernameInput = document.querySelector('#username');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const confirmPasswordInput = document.querySelector('#confirm-password');

const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check if already logged in
const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/pages/client/home/home.html';
}

// Pre-fill email if coming from landing page
const savedEmail = localStorage.getItem('registration_email');
if (savedEmail) {
    emailInput.value = savedEmail;
    localStorage.removeItem('registration_email');
}

// Handle registration
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validation
    if (!username || !email || !password || !confirmPassword) {
        showValidationError('Please fill in all fields');
        return;
    }

    // Username validation
    if (username.length < 3) {
        showValidationError('Username must be at least 3 characters long');
        usernameInput.focus();
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showValidationError('Please enter a valid email address');
        emailInput.focus();
        return;
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showValidationError(passwordValidation.message);
        passwordInput.focus();
        return;
    }

    if (password !== confirmPassword) {
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
        // Mock API simulation - Gerçek API olmadığında test için
        console.log('Attempting registration with:', { username, email });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock successful registration for demo purposes
        console.log('Mock registration successful');
        
        // Store mock user data in localStorage for testing
        const mockUser = {
            id: Date.now(),
            username: username,
            email: email,
            createdAt: new Date().toISOString()
        };
        
        // Save mock user data
        localStorage.setItem('mock_user_' + email, JSON.stringify(mockUser));
        
        // Show success message
        if (typeof showToast === 'function') {
            showToast('Registration successful! Please sign in.', 'success');
        } else {
            alert('Registration successful! Please sign in.');
        }
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = '/pages/client/login/login.html';
        }, 1500);
        
        /* 
        // Uncomment this section when real API is available:
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                email, 
                password 
            })
        });

        const data = await response.json();
        console.log('Register response:', data);

        if (response.ok) {
            alert('Registration successful! Please sign in.');
            window.location.href = '/pages/client/login/login.html';
        } else {
            alert(data.message || 'Registration failed. Please try again.');
        }
        */
        
    } catch (error) {
        console.error('Registration error:', error);
        
        if (typeof showToast === 'function') {
            showToast('Registration error. Please try again.', 'error');
        } else {
            alert('An error occurred. Please try again.');
        }
    }
});

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
    `;
    
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;

    // Insert error message after form
    const form = document.querySelector('#register-form');
    form.insertAdjacentElement('afterend', errorDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => {
                errorDiv.remove();
            }, 300);
        }
    }, 5000);

    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Real-time password validation with visual feedback
passwordInput.addEventListener('input', function() {
    const password = this.value;
    updatePasswordRequirements(password);
});

// Update password requirements visual feedback
function updatePasswordRequirements(password) {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Update length requirement
    const reqLength = document.getElementById('req-length');
    if (password.length >= minLength) {
        reqLength.classList.remove('invalid');
        reqLength.classList.add('valid');
    } else {
        reqLength.classList.remove('valid');
        reqLength.classList.add('invalid');
    }

    // Update letter requirement
    const reqLetter = document.getElementById('req-letter');
    if (hasLetter) {
        reqLetter.classList.remove('invalid');
        reqLetter.classList.add('valid');
    } else {
        reqLetter.classList.remove('valid');
        reqLetter.classList.add('invalid');
    }

    // Update number requirement
    const reqNumber = document.getElementById('req-number');
    if (hasNumber) {
        reqNumber.classList.remove('invalid');
        reqNumber.classList.add('valid');
    } else {
        reqNumber.classList.remove('valid');
        reqNumber.classList.add('invalid');
    }

    // Update special character requirement
    const reqSpecial = document.getElementById('req-special');
    if (hasSpecialChar) {
        reqSpecial.classList.remove('invalid');
        reqSpecial.classList.add('valid');
    } else {
        reqSpecial.classList.remove('valid');
        reqSpecial.classList.add('invalid');
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
