import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';

const app = express();
const PORT = 3000;

var userLoggedIn = false; // Simulating user login status
var blogList = [];

app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(session({   // 🔑 Add session middleware
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


//Home route
app.get('/', (req, res) => {
  if (!userLoggedIn) {
    res.redirect('/login');
}});

//Login and Logout routes
app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        userLoggedIn = false; // Reset login status
        blogList = []; // Clear the blog list
        res.redirect('/login'); // Redirect to login page
    });
});

// Home route after login
app.post('/home', (req, res) => {
  const username = req.body.username;
  req.session.username = username;  // Store username in session

  res.render('index.ejs',{
    username: username,
    blogList: blogList
  });
});

app.get('/home', (req, res) => {
  res.render('index.ejs', {
    username: req.session.username || 'Guest',
    blogList: blogList
  });
});

// Write blog route
app.get('/write', (req, res) => {
  res.render('write.ejs');
});

//listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
