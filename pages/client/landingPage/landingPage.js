const signInBtn = document.querySelector('#sign-in-btn');
const emailInput = document.querySelector('#email-input');
const startBtn = document.querySelector('#start-btn');
const filmalisaForm = document.querySelector('.filmalisa-form');
const userDropdown = document.getElementById('user-dropdown');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');

//Token
const token = localStorage.getItem('token');


async function registerUser(register) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/auth/signup`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(register)
    }
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}

async function loginUser(login) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/auth/login`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log('Data:', data);

        if (!response.ok) {
            loginPasswordInput.style = 'border: 1px solid red';
            loginUsernameInput.style = 'border: 1px solid red';
            setTimeout(() => {
                loginPasswordInput.style = '';
                loginUsernameInput.style = '';
                loginUsernameInput.value = '';
                loginPasswordInput.value = '';
            }, 2000)
            return
        }

        const token = data.data.tokens.access_token;

        if (token) {
            localStorage.setItem('token', token);

            // İstəsən profil məlumatlarını da saxla
            const profile = data.data.profile;
            localStorage.setItem('user', JSON.stringify(profile));

            loginPasswordInput.style = 'border: 1px solid antiqueWhite';
            loginUsernameInput.style = 'border: 1px solid antiqueWhite';
            window.location.href = '/pages/admin/dashboard/dashboard.html';

        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function getProfile() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/profile`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showProfile() {
    const profile = await getProfile();
    userAvatar.src = profile.data.img_url;
    userName.textContent = profile.data.full_name;
}

// Token varsa dropdown göster, yoxsa Sign-in göster
if (token) {
    signInBtn.textContent = 'Profile';
    signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        userDropdown.classList.toggle('show');
        showProfile();
    });
} else {
    signInBtn.addEventListener('click', () => {
        window.location.href = './pages/client/login/login.html';
    });
}

// Logout funksiyası
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    });
}

// Dropdown xaricində klikləndikdə bağla
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-menu')) {
        userDropdown.classList.remove('show');
    }
});

//EVENTS

filmalisaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    if(!token && email){
    localStorage.setItem('pendingEmail', email);
    window.location.href = '/pages/client/registr/registr.html';
    } else if(!token && !email){
        emailInput.style.border = '1px solid red';
        setTimeout(() => {
            emailInput.style.border = '';
        }, 2000);
    }
});


