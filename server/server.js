const express = require('express');
const bodyParser = require('body-parser');
const path = require('node:path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/yourDBName', // Update connection string
    collection: 'sessions'
});
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/yourDBName', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}); // ^This needs updated with the connection string for the db

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Mock user data (in-memory storage, replace with a database in production)
const users = [
    { username: 'eu@gmail.com', password: 'pp' }
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the user exists
    const user = users.find(u => u.username === username);
    if (user && bcrypt.compareSync(password, user.password)) {
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
        const hashedPassword = bcrypt.hashSync(password, 10);
        users.push({ username, hashedPassword });
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


/* This is as far as i got tonight, Some other things i'd like 
to implement here in this file are:
- Sanitize and validate inputs
- Check routes for authentication
- Add a logout route
- Implement HTTPS
- (if possible/time allows) Implement a logging system 
    for security monitoring.
*/