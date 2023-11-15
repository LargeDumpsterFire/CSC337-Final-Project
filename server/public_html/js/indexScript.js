const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const login = document.getElementById('signIn');
const signUpForm = document.getElementById('signUpForm');
const signInForm = document.getElementById('loginForm');

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
});

signInButton.addEventListener('click', () => {
    container.classList.remove('right-panel-active');
});

// Function to handle sign-up form submission
signUpForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission
    // Gather user input
    const username = document.getElementById('name-signup').value;
    const email = document.getElementById('login').value;
    const password = document.getElementById('signupPassword').value;

    // Construct the data object
    const signUpData = {
        username: username,
        email: email,
        password: password
    };

    // Send sign-up data to the server using fetch API
    fetch('/signupEndpoint', { /*endpoint here will need to be adjusted 
                                to use our signup endpoint route.*/
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData)
    })
    .then(response => {
        // Handle the response from the server
        // For example, show success/error messages to the user
        // You might redirect the user upon successful signup
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
    });
});

// Function to handle sign-in form submission
signInForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Gather user input
    const email = document.getElementById('email-login').value;
    const password = document.getElementById('loginPassword').value;

    // Construct the data object
    const signInData = {
        email: email,
        password: password
    };

    // Send sign-in data to the server using fetch API
    fetch('/loginEndpoint', { /*endpoint here will need to be adjusted 
                                to use our login endpoint route.*/
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(signInData)
    })
    .then(response => {
        // Redirect user to index.html(?) upon successful login
        // Deal with session data here
    })
    .catch(error => {
        // Handle any errors that occurred during the fetch
        // Inform the user of any errors including invalid credentials
    });
});

function togglePasswordVisibility(checkbox, passwordClass) {
    var passwordInputs = document.getElementsByClassName(passwordClass);

    Array.from(passwordInputs).forEach(function (passwordInput) {
        if (checkbox.checked) {
            passwordInput.type = 'text';
        } else {
            passwordInput.type = 'password';
        }
    });
};