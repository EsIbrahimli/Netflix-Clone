const loginForm = document.querySelector('#client-login-form');
const loginEmailInput = document.querySelector('#login-email');
const loginPasswordInput = document.querySelector('#login-password');
const loginBtn = document.querySelector('#login-btn');


//Token
const token = localStorage.getItem('token');

async function loginUser(login) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/auth/login`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login)
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        console.log('Data:', data);

        if (!response.ok) {
            loginEmailInput.style.border = '1px solid red';
            loginPasswordInput.style.border = '1px solid red';
            setTimeout(() => {
                loginEmailInput.style.border = '';
                loginPasswordInput.style.border = '';
            }, 2000)
            return
        }

        const token = data.data.tokens.access_token;

        if (token) {
            localStorage.setItem('token', token);

            // İstəsən profil məlumatlarını da saxla
            const profile = data.data.profile;
            localStorage.setItem('user', JSON.stringify(profile));

            loginEmailInput.style.border = '1px solid antiqueWhite';
            loginPasswordInput.style.border = '1px solid antiqueWhite';
            window.location.href = '/pages/client/home/home.html';

        }
    } catch (error) {
        console.error('Error:', error);
    }
}

//EVENTS
loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const login = {
        email: loginEmailInput.value.trim(),
        password: loginPasswordInput.value.trim()
    }
    console.log(login);
    loginUser(login);
});