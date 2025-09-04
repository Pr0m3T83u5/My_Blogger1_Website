import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import pg from 'pg';

const app = express();
const PORT = 3000;

//Setting up SQL Client
/* 
a database named "B1ogger" should be created in PostgreSQL before running the server
password for the database should be added here
*/
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "B1ogger",
  password: ".......",
  port: 5432,
});
db.connect();

var userLoggedIn = false; // Simulating user login status
// var blogList = [{ 
//   id: 1, 
//   title: 'Welcome', 
//   content: 'Welcome to the Blogger1 Website, enjoy your stay!', 
//   author: 'Creator' }];

// var blogIdCounter = 2; // Counter for unique blog IDs



// Middleware setup
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
}));

//General Functions==================================
async function addUser(username, password) {
    let newUserId = await db.query(
      "INSERT INTO users (user_name, password) VALUES ($1, $2) RETURNING (id)",
      [username,password]
    )
    return newUserId.rows[0].id;
}

async function getUserName(userID){
  const userData = await db.query(
    "SELECT user_name from users WHERE id=$1",
    [userID]
  );

  return userData.rows[0].user_name;
}

async function getUserID(username) {
  const userData = await db.query(
    "SELECT id FROM users WHERE user_name=$1",
    [username]
  );
  return userData.rows[0].id;
}

async function checkUser(username){
   let userName = await db.query(
    "SELECT user_name from users WHERE user_name=$1",
    [username]
  );

  return userName.rows[0].user_name;
}

async function checkPasswordExistance(username, pass){
  const userData = await db.query(
    "SELECT id FROM users WHERE user_name=$1 AND password=$2",
    [username,pass]
  );
  return userData.rows[0].id;
}

async function addBlog(title, content, author) {
  await db.query(
    "INSERT INTO blogs (blog_title, blog_content, user_name) VALUES ($1, $2, $3) RETURNING (id)",
    [title, content, author]
  ); 
}

async function getAllBlogs(){
  const blogs = await db.query(
    "SELECT * FROM blogs"
  );
  return blogs.rows;
}

async function getBlogById(blogId){
  const blog = await db.query(
    "SELECT * FROM blogs WHERE id=$1",
    [blogId]
  );
  return blog.rows[0];
}

async function getBlogsByUser(username){
  const blogs = await db.query(
    "SELECT * FROM blogs WHERE user_name=$1",
    [username]
  );
  return blogs.rows;
}
//===================================================


//Sever Routes=======================================
// Root route
app.get('/', (req, res) => {
  // if (!userLoggedIn) {
    res.redirect('/home');
  // }
});
// Home route
app.get('/home', async (req, res) => {
  // console.log(blogList);
  
  try{
    const userName = await getUserName(req.session.userId);
    const blogList = await getBlogsByUser(userName);
    res.render('index.ejs', {
    username:  userName || 'Guest',
    blogList: blogList
    });
  } catch(err){
    let blogList = await getAllBlogs();
    console.log(blogList[0]);
    res.render('index.ejs', {
    blogList: blogList
    });
  }
});
//===================================================

// Login, SignUp and Logout routes===================
//Sign-Up ---- New User
app.get('/signUp', (req, res) => {
  let errorCode = req.query.err;
  if(errorCode === '1'){
    res.render('signUp.ejs', {
      error: "Username already exists!",
    });
    //Shift to Login feature?
  } else {
    res.render('signUp.ejs');
  }
});
// ADD User to the database
app.post('/addUser', async (req, res) => {
  try{//If User already exists
    let newUserId = await addUser(req.body.username, req.body.password);
    res.redirect('/login');
  } catch(err){
    console.log(err);
    res.redirect('/signUp?err=1');
  }
});

// Login page ---- Existing User
app.get('/login', (req,res) => {
  let errorCode = req.query.err;
  if(errorCode === '1'){
    res.render('login.ejs', {
      userNameError: "Incorrect UserName",
    });
  } else if(errorCode === '2'){
    res.render('login.ejs', {
      passNameError: "Incorrect password",
    });
  } else {
    res.render('login.ejs');
  }
})
// Login form submission
app.post('/login', async (req, res) => {
  try{ //for non-existing User
    let userName = await checkUser(req.body.username);
    try{ //if Wrong password
      let UserId = await checkPasswordExistance(req.body.username, req.body.password);
      req.session.userId = UserId; //Store Username in session
      res.redirect('/home');
    } catch(err){
      console.log(err);
      res.redirect('/login?err=2');
    }
  } catch(err){
    console.log(err);
    res.redirect('/login?err=1');
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/home'); // Redirect to login page
});
//====================================================



// Blog route for writing blogs
app.get('/write', (req, res) => {
  res.render('writeEditBlog.ejs', {action: 'write' });
});
// Blog submit route when "Submit Blog" button clicked
app.post('/submitted-blog', async (req, res) => {
  let userName = await getUserName(req.session.userId);
  await addBlog(req.body['title'], req.body['content'], userName || 'Anonymous');
  res.redirect('/home'); // Redirect to home to see the updated blog list
});


// Blog route for reading blogs
app.get('/blog/:id', async (req, res) => {
      let bbrId = parseInt(req.params.id, 10); // Get blogID from path parameter
      let blog = await getBlogById(bbrId);
      console.log(blog);
      res.render('readBlog.ejs', { blog: blog });
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
  let blog = getBlogById(blogId);
  res.render('writeEditBlog.ejs', {blogID: blogId, blog: blog, action: 'edit' });
});
// Posting the edited blog details
app.post('/edit-blog/:id', (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  const blog = getBlogById(blogId);
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
