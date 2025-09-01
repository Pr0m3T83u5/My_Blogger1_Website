import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';

const app = express();
const PORT = 3000;



var userLoggedIn = false; // Simulating user login status
var blogList = [{ id: 1, 
  title: 'Welcome', 
  content: 'Welcome to the Blogger1 Website, enjoy your stay!', 
  author: 'Creator' }];

var blogIdCounter = 2; // Counter for unique blog IDs



app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(session({   // 🔑 Add session middleware
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));


//Sever Routes

// Root route
app.get('/', (req, res) => {
  if (!userLoggedIn) {
    res.redirect('/login');
}});



// Login and Logout routes
app.get('/login', (req, res) => {
  res.render('login.ejs');
});
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        userLoggedIn = false; // Reset login status
        blogList = [{ id: 1, 
  title: 'Welcome', 
  content: 'Welcome to the Blogger1 Website, enjoy your stay!', 
  author: 'Creator' }]; // Clear the blog list
        
        blogIdCounter = 2; // Reset blog ID counter
        res.redirect('/login'); // Redirect to login page
    });
});



// Home route after login
app.post('/home', (req, res) => {
  req.session.username = req.body.username;  // Store username in session
  res.redirect('/home');
});

app.get('/home', (req, res) => {
  // console.log(blogList);
  res.render('index.ejs', {
    username: req.session.username || 'Guest',
    blogList: blogList
  });
  console.log(blogList);
});


// Blog submit route when "Submit Blog" button clicked
app.post('/submitted-blog', (req, res) => {
    let blogData = {
      id: blogIdCounter++, // Assign unique ID and increment counter
      title: req.body['title'], 
      content: req.body['content'],
      author: req.session.username || 'Anonymous', 
    };
    blogList.push(blogData); // Save blogData to the in-memory list

    res.redirect('/home'); // Redirect to home to see the updated blog list
});



// Blog route for writing blogs
app.get('/write', (req, res) => {
  res.render('writeEditBlog.ejs', {action: 'write' });
});

// Blog route for reading blogs
app.get('/blog/:id', (req, res) => {
      let bbrId = parseInt(req.params.id, 10); // Get blogID from path parameter
      let blog = blogList.find(b => b.id === bbrId); // Find the blog with the matching ID
      res.render('readBlog.ejs', { blog: blog });
      console.log(blog);
    });



// Edit blog route
// Getting the Edit request for the particular blog
app.post('/blog/:id/edit', (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  console.log(blogId);
  res.redirect('/blog/'+blogId+'/edit');
});
// Rendering the edit page with the blog details
app.get('/blog/:id/edit', (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  let blog = blogList.find(b => b.id === blogId);
  res.render('writeEditBlog.ejs', {blogID: blogId, blog: blog, action: 'edit' });
});
// Posting the edited blog details
app.post('/edit-blog/:id', (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  const blog = blogList.find(b => b.id === blogId);
  if (blog) {
    blog.title = req.body['title'];
    blog.content = req.body['content'];
    res.redirect('/home'); // Redirect to home to see the updated blog list
  } else {
    res.status(404).send('Blog not found');
  }
});

// Delete blog route
app.post('/blog/:id/delete', (req, res) => {
  const blogId = parseInt(req.params.id, 10);
  blogList = blogList.filter(b => b.id !== blogId); // Remove the blog from the list
  res.redirect('/home'); // Redirect to home to see the updated blog list
});


//listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
