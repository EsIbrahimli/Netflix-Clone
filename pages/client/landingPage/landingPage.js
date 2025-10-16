// Landing Page JavaScript
const landingEmail = document.querySelector('#landing-email');
const getStartedBtn = document.querySelector('.btn-get-started');

// Store email for registration
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
        const email = landingEmail ? landingEmail.value.trim() : '';
        if (email) {
            localStorage.setItem('registration_email', email);
        }
    });
}

// Check if user is already logged in
const token = localStorage.getItem('token');
if (token) {
    window.location.href = '/pages/client/home/home.html';
}
