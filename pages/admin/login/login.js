const loginForm = document.querySelector('#admin-login-form');
const loginUsernameInput = document.querySelector('#login-username');
const loginPasswordInput = document.querySelector('#login-password');
const loginBtn = document.querySelector('#login-btn');

const token = localStorage.getItem('token');

async function loginUser(login) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/auth/admin/login`;
    const options = {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(login)
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

loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const login = {
        email: loginUsernameInput.value.trim(),
        password: loginPasswordInput.value.trim()
    }

    console.log(login);
    loginUser(login);

})