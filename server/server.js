const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const connectStr = '';
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
          shapesData: String // JSON string to store shapes data
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
          res.status(401).json({ success: false, 
                                 message: 'Unauthorized: Invalid session' });
        }
      } else {
        res.status(401).json({ success: false, 
                               message: 'Unauthorized: Please log in' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ success: false, 
                             message: 'Authentication error' });
    }
  };

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ success: false, 
                                        message: 'Invalid credentials' });
      }
      req.session.user = user.username;
<<<<<<< Updated upstream
      res.redirect('/home.html?username=${user.username}');
  } catch (error) {
=======
      
      console.log("username", req.session.user)
      res.status(200).json({ success: true, username: user.username });
    } catch (error) {
>>>>>>> Stashed changes
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
          res.status(500).send({ success: false, 
                                 message: 'Error logging out' });
      } else {
          res.clearCookie('connect.sid'); // Clear the session cookie
          delete req.session.user; // Unset the session user
          res.redirect('./index.html'); 
          // Redirect to login after logout
      }
  });
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
            return res.status(404).json({ success: false, 
                                          message: 'User not found' });
        }

        let imageName;
        let isDuplicate = true;
        while (isDuplicate) {
            const randomNumber = Math.floor(1000 + Math.random() * 9000);
            imageName = `Project${randomNumber}.jpeg`;

            // Check if the generated name already exists in canvasImages array
            const isExisting = currentUser.projects.some(image => image.imageName === imageName);
            if (!isExisting) {
                isDuplicate = false; // Exit the loop if the name is unique
            }
        }

        // Get the imageData from the request body
        const { imageData } = req.body;

        // Convert base64 imageData to a Buffer object
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageDataBuffer = Buffer.from(base64Data, 'base64');

        // Create new canvas object /w generated name and image data
        const newCanvasImage = {
            imageName: imageName,
            imageData: imageDataBuffer,
            imageType: 'image/jpeg',
            shapesData: req.body.shapesData
        };
        console.log(newCanvasImage); // For debugging

        // Push the new canvas image to the user's projects array
        currentUser.projects.push(newCanvasImage);
        console.log(currentUser.projects); // For debugging

        // Save the updated user document
        await currentUser.save();

        // Respond with a success message
        res.status(200).json({ success: true, 
                               message: 'Canvas image saved successfully' });
    } catch (error) {
        console.error('Error saving canvas image:', error);
        res.status(500).json({ success: false, message: 'Failed to save canvas image' });
    }
});

<<<<<<< Updated upstream
// Route to retrieve canvas images from database
app.get('/home/:username', requireAuth, async (req, res) => {
  try {
    const userId = req.params.username;
    const user = await User.findById(username); 
    // Fetch the user data from MongoDB based on the userId
=======
// Route to send the home.html file with user-specific data
app.get('/home.html/:username', requireAuth, async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
>>>>>>> Stashed changes

    // If the user is found, send the user's projects data as a response
    if (user) {
<<<<<<< Updated upstream
      const projectsData = user.projects.map(project => ({
        imageName: project.imageName,
        imageData: project.imageDataBuffer,
        imageType: project.imageType,
        shapesData: project.shapesData
      }));

      res.status(200).json(projectsData);
    } else {
      res.status(404).json({ message: 'User not found' });
=======
      // Send the 'home.html' file
      res.sendFile(path.join(__dirname, 'public_html', 'home.html'));
    } else {
      // Handle if the user is not found
      res.status(404).send('User not found');
>>>>>>> Stashed changes
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

app.get('/canvas', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'canvas.html'));
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