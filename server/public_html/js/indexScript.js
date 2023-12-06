const signUpButton = document.getElementById('signUp');
const logInButton = document.getElementById('login');
const container = document.getElementById('container');
const signUpForm = document.getElementById('signUpForm');
const logInForm = document.getElementById('loginForm');

// Function to handle sign-up form submission
const handleSignUp = async (event) => {
    event.preventDefault();
    const username = document.getElementById('name-signup').value;
    const email = document.getElementById('email-signup').value;
    const password = document.getElementById('passwordSignup').value;

    const signUpData = {
        username: username,
        email: email, 
        password: password
    };

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signUpData)
        });

        if (response.ok) {
            window.alert('Signed up successfully!');
            window.location.href = './index.html';
        }
        else if (response.status === 400) {
            window.alert('Username already taken');
            window.location.href = './index.html';
        }
        else {
            window.alert('Error signing up');
            window.location.href = './index.html';
        }
    } catch (error) {
        // Handle fetch error
        console.error('Error signing up:', error);
        window.alert('Error signing up');
        window.location.href = './index.html';
    }
};

// Function to handle sign-in form submission
const handleLogIn = async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('passwordLogin').value;

    const logInData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logInData)
        });

        if (response.ok) {
            window.alert('Logged in successfully');
            window.location.href = './home.html';
        } else if (response.status === 401) {
            console.error('Invalid credentials');
            window.alert('Invalid credentials');
            window.location.href = './index.html';
        } else {
            console.error('Error logging in');
            window.alert('Error logging in');
            window.location.href = './index.html';
        }
    } catch (error) {
        console.error('Error logging in:', error);
        window.alert('Error logging in');
        window.location.href = './index.html';
    }
};

// Event listeners
signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

logInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

signUpForm.addEventListener('submit', handleSignUp);
logInForm.addEventListener('submit', handleLogIn);

const toggleSignupPassword = document.querySelector('#showSignupPassword');
const toggleLogInPassword = document.querySelector('#showLoginPassword');

const signupPassword = document.querySelector('#passwordSignup');
const logInPassword = document.querySelector('#passwordLogin');

toggleSignupPassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = signupPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    signupPassword.setAttribute('type', type);
    
});
toggleLogInPassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = logInPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    logInPassword.setAttribute('type', type); 
});