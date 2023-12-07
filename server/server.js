/*
Names: Jacob Cohen, Seth Perritt, Hunter Copening, Josh Puhala
project: Final Project CSC 337
purpose: This JavaScript file serves as the backend of the website. 
It is responsible for managing backend interactions with the database, 
routing, and handling authentication and encryption processes.

*/


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const connectStr = 'mongodb+srv://jc:Bade24Mutt@users.0xwayee.mongodb.net/';
const store = new MongoDBStore({
  uri: connectStr,
  collection: 'sessions'
});
const bcrypt = require('bcrypt');
const app = express();
const port = 80;

mongoose.connect(connectStr, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

store.on('error', function (error) {
  console.error('Session store error:', error);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'SuperSecretSpecialKeyThatNoOneWillEverGuess',
  resave: false,
  saveUninitialized: true,
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false,
    httpOnly: true
  }
}));

// Serve static files from the 'public_html' directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Define the user schema, can be adjusted as needed.
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  projects: [
    {
      imageName: String, // Name to identify the image
      imageData: Buffer, // Buffer to store binary image data
      imageType: String,  // MIME type of the image
      shapesData: String, // JSON string to store shapes data
      lastEdited: { type: Date, default: Date.now() }
    }
  ]
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
        next(); // Authenticated, proceed to next middleware/route handler
      } else {
        res.status(401).json({
          success: false,
          message: 'Unauthorized: Invalid session'
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Please log in'
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    req.session.user = user.username;

    console.log("username", req.session.user)
    res.status(200).json({ success: true, username: user.username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send({ success: false, message: 'Error logging in' });
  }
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      return res.status(400).send({ success: false, message: 'Username or Email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    res.send({ success: true });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).send({ success: false, message: 'Error signing up' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send({
        success: false,
        message: 'Error logging out'
      });
    } else {
      res.clearCookie('connect.sid'); // Clear the session cookie
      delete req.session.user; // Unset the session user
      res.redirect('./index.html');
      // Redirect to login after logout
    }
  });
});
app.get('/projects/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Extract relevant information from the user object, e.g., projects
    const projects = user.projects.map(project => ({
      _id: project._id,
      name: project.name,
      // Include other project properties you need
    }));

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});
// Route to save canvas image to database
app.post('/save-canvas', requireAuth, async (req, res) => {
  try {
    const username = req.session.user; // Retrieve username from session

    if (!username) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Retrieve the current user from the database using the username
    const currentUser = await User.findOne({ username });
    console.log(currentUser); // For debugging

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get the imageData from the request body
    const { imageData } = req.body;

    // Convert base64 imageData to a Buffer object
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const imageDataBuffer = Buffer.from(base64Data, 'base64');

    // Create new canvas object /w generated name and image data
    const newCanvasImage = {
      imageName: generateUniqueImageName(currentUser.projects),
      imageData: imageDataBuffer,
      imageType: 'image/jpeg',
      shapesData: req.body.shapesData,
      lastEdited: new Date() // Save the current timestamp as lastEdited
    };
    console.log(newCanvasImage); // For debugging

    // Push the new canvas image to the user's projects array
    currentUser.projects.push(newCanvasImage);
    console.log(currentUser.projects); // For debugging

    // Save the updated user document
    await currentUser.save();

    // Respond with a success message
    res.status(200).json({
      success: true,
      message: 'Canvas image saved successfully'
    });
  } catch (error) {
    console.error('Error saving canvas image:', error);
    res.status(500).json({ success: false, message: 'Failed to save canvas image' });
  }
});

// Function to generate a unique image name
function generateUniqueImageName(projects) {
  let isDuplicate = true;
  let imageName;

  while (isDuplicate) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    imageName = `Project${randomNumber}`;

    // Checks if the generated name already exists in projects array
    const isExisting = projects.some(project => project.imageName === imageName);
    if (!isExisting) {
      isDuplicate = false; // Exit the loop if the name is unique
    }
  }

  return imageName;
}



// Route to send the home.html file with user-specific data
// Update the server-side route to handle /home/:username
app.get('/home/:username', requireAuth, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });

    // If the user is found, retrieve the user's projects data
    if (user) {
      // Send the user's projects data as a JSON response
      res.json({ projects: user.projects });
    } else {
      // Handle if the user is not found
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for the root path ("/") to serve home.html
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'home.html'));
});

// Route handlers for the individual pages if someone tries to access them 
// directly via URL
app.get('/index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});

app.get('/canvas', requireAuth, async (req, res) => {
  const imageName = req.query.imageName;

  try {
    // Find the user who owns the project
    // This requires knowing which user to look up
    const user = await User.findOne({ 'projects.imageName': imageName });
    if (!user) {
      return res.status(404).send('Project not found');
    }

    // Extract the specific project
    const project = user.projects.find(p => p.imageName === imageName);

    if (!project) {
      return res.status(404).send('Project not found');
    }

    res.json(project);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/settings', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'settings.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'about.html'));
});

app.get('/features', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'features.html'));
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
