const express = require('express');
const bodyParser = require('body-parser');
const path = require('node:path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const connectStr = 'mongodb+srv://doadmin:Package-L0ck@dbaas-db-2541741-298d880c.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=dbaas-db-2541741&tls=true&tlsCAFile=<replace-with-path-to-CA-cert>';
const store = new MongoDBStore({
    uri: connectStr,
    collection: 'sessions'
});
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

mongoose.connect(connectStr, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'SuperSecretSpecialKeyThatNoOneWillEverGuess',
    resave: false,
    saveUninitialized: false,
    store: store
}));

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Define the user schema, can be adjusted as needed.
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);
module.exports = User;

// Middleware to check authentication
// Insert after route to be checked, before (req, res)
const requireAuth = async (req, res, next) => {
    try {
      if (req.session && req.session.user) {
        const user = await User.findOne({ username: req.session.user });
  
        if (user) {
          next(); // User is authenticated, proceed to the next middleware/route handler
        } else {
          res.status(401).json({ success: false, message: 'Unauthorized: Invalid session' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ success: false, message: 'Authentication error' });
    }
  };

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
  
      req.session.user = username; // Set the session user
  
      res.send({ success: true });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).send({ success: false, message: 'Error logging in' });
    }
  });  

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ username });
  
      if (existingUser) {
        return res.status(400).send({ success: false, message: 'Username already taken' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
  
      await newUser.save();
  
      res.send({ success: true });
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).send({ success: false, message: 'Error signing up' });
    }
  });

// Route for the root path ("/") to serve home.html
app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'home.html'));
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send({ success: false, message: 'Error logging out' });
        } else {
            res.clearCookie('connect.sid'); // Clear the session cookie
            delete req.session.user; // Unset the session user
            res.redirect('/'); // Redirect to the home page or any other desired location after logout
        }
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


/* 
To-do:
- Sanitize and validate inputs (espress-validator)
- Implement HTTPS (Requires SSL certificate and key, can be self-signed)
*/