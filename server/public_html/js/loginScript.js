const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const login = document.getElementById('signIn');

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});
function togglePasswordVisibility(checkbox, passwordId) {
    const passwordInput = document.getElementById(passwordId);

    if (checkbox.checked) {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Perform login request
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('password-login').value;

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        return response.json();
    })
    .then(data => {
        console.log('Login successful');
        window.location.href = '/home.html'; // Use href to allow going back
    })
    .catch(error => {
        console.error('Login failed:', error.message);
        alert('Login failed: ' + error.message);
    });
});

document.getElementById('signUpForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Perform signup request
    const username = document.getElementById('name-signup').value;
    const email = document.getElementById('login').value;
    const password = document.getElementById('signupPassword').value;

    fetch('/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Redirect to the homepage on successful signup
            console.log('Signup successful');
            window.location.replace('/home.html');
        } else {
            alert('Signup failed: ' + data.message);
        }
    });
});

