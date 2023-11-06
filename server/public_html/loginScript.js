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

document.getElementById("loadIndexButton").addEventListener("click", function() {
    console.log("loadIndexButton clicked");
    // Change the window's location to "index.html"
    window.location.href = "successLogin_html/index.html";
});


