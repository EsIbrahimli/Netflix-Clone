const signInBtn = document.querySelector('#sign-in-btn');
const emailInput = document.querySelector('#email-input');
const startBtn = document.querySelector('#start-btn');
const filmalisaForm = document.querySelector('.filmalisa-form');

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


//EVENTS
signInBtn.addEventListener('click', () => {
    window.location.href = '../login/login.html';
});

filmalisaForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const register = {
        email: emailInput.value
    }
  
    window.location.href = '/pages/client/registr/registr.html';
    registerUser(register);
});

