import { BACKEND_PORT, post, path } from './config.js';
import { fileToDataUrl, clear, popUpError } from './helpers.js';
import { mainMenu } from './main.js';

export function createLogin() {
    base.classList.add('wrapper-auth');
    const loginContainer = document.createElement('div');
    loginContainer.classList.add('auth-container');
    base.appendChild(loginContainer);
    
    const welcomeDiv = document.createElement('div');
    const welcomeHeader = document.createElement('h3');
    welcomeHeader.textContent = 'Welcome Back to Slackr!';
    welcomeDiv.appendChild(welcomeHeader);
    loginContainer.appendChild(welcomeDiv);

    const form = document.createElement('form');
    form.classList.add('auth-form');
    loginContainer.appendChild(form);

    const emailDiv = document.createElement('div');
    const elabelDiv = document.createElement('div');
    elabelDiv.classList.add('div-label');
    const elabel = document.createElement('label');
    elabel.setAttribute('for', 'email');
    elabel.textContent = 'EMAIL';
    elabelDiv.appendChild(elabel);
    emailDiv.appendChild(elabelDiv);
    const einput = document.createElement('input');
    einput.classList.add('auth-input');
    einput.type = 'email';
    einput.name = 'email';
    emailDiv.appendChild(einput);
    form.appendChild(emailDiv);

    const passDiv = document.createElement('div');
    const plabelDiv = document.createElement('div');
    plabelDiv.classList.add('div-label');
    const plabel = document.createElement('label');
    plabel.setAttribute('for', 'password');
    plabel.textContent = 'PASSWORD';
    plabelDiv.appendChild(plabel);
    passDiv.appendChild(plabelDiv);
    const pinput = document.createElement('input');
    pinput.classList.add('auth-input');
    pinput.type = 'password';
    pinput.name = 'password';
    passDiv.appendChild(pinput);
    form.appendChild(passDiv);

    const loginbtDiv = document.createElement('div');
    const loginbt = document.createElement('button');
    loginbt.classList.add('auth-button');
    loginbt.type = 'submit';
    loginbt.textContent = 'Log In';
    loginbt.id = 'login-button';
    loginbtDiv.appendChild(loginbt);
    form.appendChild(loginbtDiv);

    const registerDiv = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = 'Need an account? ';
    registerDiv.appendChild(span);
    const registerbt = document.createElement('button');
    registerbt.textContent = 'Register';
    registerbt.classList.add('register-button');
    registerbt.id = 'register-transition';
    registerDiv.appendChild(registerbt);
    loginContainer.appendChild(registerDiv);
    
    registerbt.addEventListener('click', () => {
        clear();
        createRegister();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        post.body = JSON.stringify({email: einput.value, password: pinput.value});
        fetch(path + 'auth/login', post)
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                popUpError(data.error);
            } else {
                clear();
                localStorage.setItem('token', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('password', pinput.value);
                mainMenu(data.token, data.userId);
            }
        }); 
    })
}

export function createRegister() {
    base.classList.add('wrapper-auth');
    const registerContainer = document.createElement('div');
    registerContainer.classList.add('auth-container');
    base.appendChild(registerContainer);
    registerContainer.style.height = registerContainer.offsetHeight + 100 + 'px';
    
    const welcomeDiv = document.createElement('div');
    const welcomeHeader = document.createElement('h3');
    welcomeHeader.textContent = 'Welcome to Slackr!';
    welcomeDiv.appendChild(welcomeHeader);
    registerContainer.appendChild(welcomeDiv);

    const form = document.createElement('form');
    form.classList.add('auth-form');
    registerContainer.appendChild(form);

    const nameDiv = document.createElement('div');
    const nlabelDiv = document.createElement('div');
    nlabelDiv.classList.add('div-label');
    const nlabel = document.createElement('label');
    nlabel.setAttribute('for', 'name');
    nlabel.textContent = 'NAME';
    nlabelDiv.appendChild(nlabel);
    nameDiv.appendChild(nlabelDiv);
    const ninput = document.createElement('input');
    ninput.classList.add('auth-input');
    ninput.type = 'name';
    ninput.name = 'name';
    nameDiv.appendChild(ninput);
    form.appendChild(nameDiv);

    const emailDiv = document.createElement('div');
    const elabelDiv = document.createElement('div');
    elabelDiv.classList.add('div-label');
    const elabel = document.createElement('label');
    elabel.setAttribute('for', 'email');
    elabel.textContent = 'EMAIL';
    elabelDiv.appendChild(elabel);
    emailDiv.appendChild(elabelDiv);
    const einput = document.createElement('input');
    einput.classList.add('auth-input');
    einput.type = 'email';
    einput.name = 'email';
    emailDiv.appendChild(einput);
    form.appendChild(emailDiv);

    const passDiv = document.createElement('div');
    const plabelDiv = document.createElement('div');
    plabelDiv.classList.add('div-label');
    const plabel = document.createElement('label');
    plabel.setAttribute('for', 'password');
    plabel.textContent = 'PASSWORD';
    plabelDiv.appendChild(plabel);
    passDiv.appendChild(plabelDiv);
    const pinput = document.createElement('input');
    pinput.classList.add('auth-input');
    pinput.type = 'password';
    pinput.name = 'password';
    passDiv.appendChild(pinput);
    form.appendChild(passDiv);

    const cpassDiv = document.createElement('div');
    const cplabelDiv = document.createElement('div');
    cplabelDiv.classList.add('div-label');
    const cplabel = document.createElement('label');
    cplabel.setAttribute('for', 'password');
    cplabel.textContent = 'CONFIRM PASSWORD';
    cplabelDiv.appendChild(cplabel);
    cpassDiv.appendChild(cplabelDiv);
    const cpinput = document.createElement('input');
    cpinput.classList.add('auth-input');
    cpinput.type = 'password';
    cpinput.name = 'cpassword';
    cpassDiv.appendChild(cpinput);
    form.appendChild(cpassDiv);

    const regbtDiv = document.createElement('div');
    const regbt = document.createElement('button');
    regbt.classList.add('auth-button');
    regbt.type = 'submit';
    regbt.textContent = 'Register';
    regbt.id = 'register-button';
    regbtDiv.appendChild(regbt);
    form.appendChild(regbtDiv);
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        post.body = JSON.stringify({email: einput.value, password: pinput.value, name: ninput.value});
        if (cpinput.value === pinput.value) {
            fetch(path + 'auth/register', post)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    popUpError(data.error);
                } else {
                    clear();
                    console.log(data.token);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('password', pinput.value);
                    mainMenu(data.token, data.userId);
                }
            });
        } else {
            popUpError('The password does not match');
        }
    });
}