const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('loginForm');

// Function to handle sign-up form submission
const handleSignUp = async (event) => {
    event.preventDefault();
    const username = document.getElementById('name-signup').value;
    const email = document.getElementById('login').value;
    const password = document.getElementById('signupPassword').value;

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
const handleSignIn = async (event) => {
    event.preventDefault();
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('loginPassword').value;

    const signInData = {
        email: email,
        password: password
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signInData)
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

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

signUpForm.addEventListener('submit', handleSignUp);
signInForm.addEventListener('submit', handleSignIn);


function togglePasswordVisibility(checkbox, passwordClass) {
    let passwordInputs = document.getElementsByClassName(passwordClass);

    Array.from(passwordInputs).forEach(function (passwordInput) {
        if (checkbox.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
};