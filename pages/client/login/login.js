const loginForm = document.querySelector('#login-form');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check if already logged in
const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/pages/client/home/home.html';
}

// Handle login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        // Mock API simulation - Gerçek API olmadığında test için
        console.log('Attempting login with:', { email });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if user exists in localStorage (from registration)
        const mockUserKey = 'mock_user_' + email;
        const mockUserData = localStorage.getItem(mockUserKey);
        
        if (mockUserData) {
            // Mock successful login
            const mockUser = JSON.parse(mockUserData);
            const mockToken = 'mock_token_' + Date.now();
            
            // Store mock token and user info
            localStorage.setItem('token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));
            
            console.log('Mock login successful');
            
            if (typeof showToast === 'function') {
                showToast('Login successful!', 'success');
            }
            
            // Redirect to home
            setTimeout(() => {
                window.location.href = '/pages/client/home/home.html';
            }, 1000);
            
        } else {
            // Try real API if available, otherwise show error
            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (response.ok && data.data && data.data.tokens) {
                    // Store token and user info
                    const accessToken = data.data.tokens.access_token;
                    localStorage.setItem('token', accessToken);
                    
                    // Store user profile
                    if (data.data.profile) {
                        localStorage.setItem('user', JSON.stringify(data.data.profile));
                    }

                    // Redirect to home
                    window.location.href = '/pages/client/home/home.html';
                } else {
                    throw new Error(data.message || 'Login failed');
                }
            } catch (apiError) {
                // API failed, show error for mock users
                console.error('API login failed, checking mock users');
                
                if (typeof showToast === 'function') {
                    showToast('User not found. Please register first.', 'error');
                } else {
                    alert('User not found. Please register first.');
                }
                
                emailInput.style.borderColor = 'red';
                passwordInput.style.borderColor = 'red';
                
                setTimeout(() => {
                    emailInput.style.borderColor = '';
                    passwordInput.style.borderColor = '';
                }, 2000);
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        if (typeof showToast === 'function') {
            showToast('Login error. Please try again.', 'error');
        } else {
            alert('An error occurred. Please try again.');
        }
    }
});
