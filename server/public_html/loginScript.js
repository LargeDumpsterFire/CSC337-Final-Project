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

document.getElementById("loginInButton").addEventListener("click", function () {
    console.log("loginInButton clicked");
    auth();


});
document.getElementById("singUpButton").addEventListener("click", function () {
    console.log("singUpButton clicked");

});
function auth() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if (email === "" && password === "") {
        window.location.href= "about.html";
        // alert("You Are a ADMIN");

    } else {
        alert("Invalid information");
        return;
    }


}
