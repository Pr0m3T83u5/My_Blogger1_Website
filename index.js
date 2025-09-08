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
  database: "B1ogger", // Database name
  password: "...", // Add your database password here
  port: 5432,
});
db.connect();

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

/**
 * Adds a new user to the database table 'users'
 * @param {String} username Username of the user
 * @param {String} password Password of the user
 * @returns the added user's ID
 */
async function addUser(username, password) {
    let newUserId = await db.query(
      "INSERT INTO users (user_name, password) VALUES ($1, $2) RETURNING (id)",
      [username,password]
    )
    return newUserId.rows[0].id;
}

/**
 * Return the name of the user based off the userID
 * @param {int} userID User's ID
 * @returns name of the user
 */
async function getUserName(userID){
  const userData = await db.query(
    "SELECT user_name from users WHERE id=$1",
    [userID]
  );

  return userData.rows[0].user_name;
}

/**
 * Return the ID of the user based off the username
 * @param {String} username 
 * @returns ID of the user
 */
async function getUserID(username) {
  const userData = await db.query(
    "SELECT id FROM users WHERE user_name=$1",
    [username]
  );
  return userData.rows[0].id;
}

/**
 * Check if the user exists in the database
 * @param {String} username 
 * @returns username if exists, 
 *          else throws error
 */
async function checkUser(username){
   let userName = await db.query(
    "SELECT user_name from users WHERE user_name=$1",
    [username]
  );

  return userName.rows[0].user_name;
}
/**
 * Check if the password matches the username in the database
 * @param {String} username username entered by the user
 * @param {String} pass password entered by the user
 * @returns userID if the username and password match
 *          else throws error
 */
async function checkPasswordExistance(username, pass){
  const userData = await db.query(
    "SELECT id FROM users WHERE user_name=$1 AND password=$2",
    [username,pass]
  );
  return userData.rows[0].id;
}

//Blog related functions
/**
 * Adds a new blog to the database table 'blogs'
 * @param {String} title title of the blog
 * @param {String} content content of the blog
 * @param {String} author author of the blog
 */
async function addBlog(title, content, author) {
  await db.query(
    "INSERT INTO blogs (blog_title, blog_content, user_name) VALUES ($1, $2, $3) RETURNING (id)",
    [title, content, author]
  ); 
}

/**
 * Fetches all blogs from the database
 * @returns list of all blogs
 */
async function getAllBlogs(){
  const blogs = await db.query(
    "SELECT * FROM blogs"
  );
  return blogs.rows;
}

/**
 * Fetches a blog based on the blog ID
 * @param {int} blogId ID of the blog
 * @returns blog details
 */
async function getBlogById(blogId){
  const blog = await db.query(
    "SELECT * FROM blogs WHERE id=$1",
    [blogId]
  );
  return blog.rows[0];
}

/**
 * Fetches all blogs written by a specific user
 * @param {String} username username of the author
 * @returns list of blogs written by the user
 */
async function getBlogsByUser(username){
  const blogs = await db.query(
    "SELECT * FROM blogs WHERE user_name=$1",
    [username]
  );
  return blogs.rows;
}

/**
 * Edits a blog based on the blog ID
 * @param {String} content new content of the blog
 * @param {String} title new title of the blog
 * @param {int} blogId ID of the blog to be edited
 */
async function editBlog(content, title, blogId){
  await db.query(
    "UPDATE blogs SET (blog_content,blog_title)=($1,$2) WHERE id=$3",
    [content, title, blogId]
  );
}

/**
 * Deletes a blog based on the blog ID
 * @param {int} blogId ID of the blog to be deleted
 */
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
  } else {
    res.render('signUp.ejs');
  }
});
// ADD User to the database
app.post('/addUser', async (req, res) => {
  try{
    let newUserId = await addUser(req.body.username, req.body.password);
    res.redirect('/login');
  } catch(err){ //If User already exists
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
  try{ 
    let userName = await checkUser(req.body.username);
    try{ 
      let UserId = await checkPasswordExistance(req.body.username, req.body.password);
      req.session.userId = UserId; //Store Username in session
      userLoggedIn = true;
      res.redirect('/home');
    } catch(err){ //Wrong password
      console.log(err);
      res.redirect('/login?err=2');
    }
  } catch(err){ //Non-existing User
    console.log(err);
    res.redirect('/login?err=1');
  }
});
//====================================================



//Write, Edit, Read and Delete Blog routes=================
//Write Blog Route----------------
app.get('/write', (req, res) => {
  res.render('writeEditBlog.ejs', {action: 'write' });
});
//when sumbit button is clicked
app.post('/submitted-blog', async (req, res) => {
  let userName = await getUserName(req.session.userId);
  await addBlog(req.body['title'], req.body['content'], userName || 'Anonymous');
  res.redirect('/home'); // Redirect to home to see the updated blog list
});

//Read Blog Route-----------------
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

// Edit blog route----------------
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
  }
});

// Delete blog route----------------
app.post('/blog/:id/delete', async (req, res) => {
  const blogId = parseInt(req.params.id, 10);
  await deleteBlog(blogId); // Remove the blog from the list
  res.redirect('/home'); // Redirect to home to see the updated blog list
});
//=======================================================

//listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
