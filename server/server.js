const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Mock user data (in-memory storage, replace with a database in production)
const users = [
    { username: 'eu@gmail.com', password: 'pp' }
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Redirect to home.html on successful login
        res.send({ success: true });
    } else {
        console.log('Login failed: Invalid credentials');
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});


app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the username is taken
    if (users.some(u => u.username === username)) {
        res.status(400).send({ success: false, message: 'Username already taken' });
    } else {
        // Add the new user
        users.push({ username, password });
        res.send({ success: true });
    }
});

// Route for the root path ("/") to serve login.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'home.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
