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
  password: "...",
  port: 5432,
});
db.connect();


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
//User related functions 
var userLoggedIn = false; // Simulating user login status

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

//Blog related functions
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

async function editBlog(content, title, blogId){
  await db.query(
    "UPDATE blogs SET (blog_content,blog_title)=($1,$2) WHERE id=$3",
    [content, title, blogId]
  );
}

async function deleteBlog(blogId){
  await db.query(
    "DELETE FROM blogs WHERE id=$1",
    [blogId]
  );
}
//===================================================


//Sever Routes=======================================
// Root route
app.get('/', (req, res) => {
  req.session.destroy();
  res.redirect('/home');
});
// Home route
app.get('/home', async (req, res) => {
  try{
    const userName = await getUserName(req.session.userId);
    const blogList = await getBlogsByUser(userName);
    res.render('index.ejs', {
      username:  userName,
      blogList: blogList || [],
      access: userLoggedIn || false
    });
  } catch(err){
    let blogList = await getAllBlogs();
    res.render('index.ejs', {
    blogList: blogList,
    access: userLoggedIn || false
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
      userLoggedIn = true;
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

//====================================================



//Write, Edit, Read and Delete Blog routes=================
//Write Blog Route
app.get('/write', (req, res) => {
  res.render('writeEditBlog.ejs', {action: 'write' });
});
//when sumbit button is clicked
app.post('/submitted-blog', async (req, res) => {
  let userName = await getUserName(req.session.userId);
  await addBlog(req.body['title'], req.body['content'], userName || 'Anonymous');
  res.redirect('/home'); // Redirect to home to see the updated blog list
});

//Read Blog Route
app.get('/blog/:id', async (req, res) => {
      let bbrId = parseInt(req.params.id, 10); // Get blogID from path parameter
      let blog = await getBlogById(bbrId);
      try{
        let userName = await getUserName(req.session.userId);
        res.render('readBlog.ejs', { blog: blog, username: userName});
      } catch(err){
        console.log(err);
        res.render('readBlog.ejs', { blog: blog, username: null});
      }
      
    });

// Edit blog route
// Getting the Edit request for the particular blog
app.post('/blog/:id/edit', (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  res.redirect('/blog/'+blogId+'/edit');
});
// Rendering the edit page with the blog details
app.get('/blog/:id/edit', async (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  let blog = await getBlogById(blogId);
  res.render('writeEditBlog.ejs', {blogID: blogId, blog: blog, action: 'edit' });
});
// Posting the edited blog details
app.post('/edit-blog/:id', async (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  try{
    await editBlog(req.body['content'], req.body['title'], blogId);
    res.redirect('/blog/'+blogId);
  } catch(err){
    console.log(err);
    // res.render('writeEditBlog.ejs', {blogID: blogId, blog: blog, action: 'edit', error: "Error updating the blog. Please try again." });
  }
});

// Delete blog route
app.post('/blog/:id/delete', async (req, res) => {
  const blogId = parseInt(req.params.id, 10);
  await deleteBlog(blogId); // Remove the blog from the list
  res.redirect('/home'); // Redirect to home to see the updated blog list
});


//listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
