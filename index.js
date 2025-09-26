import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import passport from 'passport';
import { Strategy } from 'passport-local';

const app = express();
const PORT = 3000;
const saltingRounds = 10;

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

// Middleware setup==================================
app.use(express.static('public')); // Serve static files from the 'public' directory
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

//Create a Session
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000*60*60*24 //in milliseconds: 1000ms => 1s => 1s*60 => 1min*60 = 1hr*24 => 1day
  }
}));

app.use(passport.initialize());
app.use(passport.session());

//===================================================


//General Functions==================================
/**
 * User Related functions
 * Blog related functions
 */



//User related functions 
/**
 * Adds a new user to the database table 'users'
 * @param {String} username Username of the user
 * @param {String} password Password of the user
 * @returns the added user's ID
 */
async function addUser(username, password) {
    await db.query(
      "INSERT INTO users (user_name, password) VALUES ($1, $2) RETURNING (id)",
      [username,password]
    )
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
   let userData = await db.query(
    "SELECT * from users WHERE user_name=$1",
    [username]
  );

  return userData;
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


//==================================================================Server Routes==================================================================
// Root route
app.get('/', (req, res) => {
  req.session.destroy();
  res.redirect('/home');
});
// Home route
app.get('/home', async (req, res) => {
  if(req.isAuthenticated()){
      const userName = req.user.user_name;
      const blogList = await getBlogsByUser(userName);
      res.render('index.ejs', {
        username:  userName,
        blogList: blogList || [],
      });
      console.log(userName);
  }else{
      let blogList = await getAllBlogs();
      res.render('index.ejs', {
      blogList: blogList,
      });
  }
});
//========================================================

// Login, SignUp and Logout routes========================
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
  let userName = req.body.username;
  let userData = await checkUser(userName);
  if(userData.rows.length > 0){
    res.redirect('/signUp?err=1');
  } else{
    try{
      //password hashing
      bcrypt.hash(req.body.password, saltingRounds, async (err, hash) =>{
        if(err){
          console.log('Error in pass Hashing:', err);
        } else{
          await addUser(req.body.username, hash);
        res.redirect('/login');
        }
      });
    } catch(err){ //If User already exists
      console.log(err);
    }
  }
});

// Login page ---- Existing User
app.get('/login', (req,res) => {
  let errorCode = req.query.err;
  if(errorCode === '0'){
    res.render('login.ejs', {
      error: "Incorrect Credentials",
    });
  } else {
    res.render('login.ejs');
  }
})
// Login form submission
app.post('/login', passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login?err=0"
  }
));
//========================================================


//Write, Edit, Read and Delete Blog routes=================
//Write Blog Route----------------
app.get('/write', (req, res) => {
  res.render('writeEditBlog.ejs', {action: 'write' });
});
//when sumbit button is clicked
app.post('/submitted-blog', async (req, res) => {
  if(req.isAuthenticated()){
    let userName = req.user.user_name;
    await addBlog(req.body['title'], req.body['content'], userName || 'Anonymous');
    res.redirect('/home'); // Redirect to home to see the updated blog list
  } else {
    res.redirect('/home');
  }
});

//Read Blog Route-----------------
app.get('/blog/:id', async (req, res) => {
      let bbrId = parseInt(req.params.id, 10); // Get blogID from path parameter
      let blog = await getBlogById(bbrId);
      try{
        let userName = '';
        if(req.isAuthenticated()) userName=req.user.user_name;
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
  if(req.isAuthenticated()){
    res.redirect('/blog/'+blogId+'/edit');
  } else {
    res.redirect('/blog/'+blogId)
  }
});
// Rendering the edit page with the blog details
app.get('/blog/:id/edit', async (req, res) => {
  let blogId = parseInt(req.params.id, 10);
  let blog = await getBlogById(blogId);
  if(req.isAuthenticated()){
    res.render('writeEditBlog.ejs', {blogID: blogId, blog: blog, action: 'edit' });
  } else{
    res.render('writeEditBlog.ejs', {action: 'AuthError' });;
  }
  
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
  if(req.isAuthenticated()){
  const blogId = parseInt(req.params.id, 10);
  await deleteBlog(blogId); // Remove the blog from the list
  res.redirect('/home'); // Redirect to home to see the updated blog list
  } else{
    res.redirect('/login');
  }
});
//========================================================

//Passport local-Stratergy implementation
passport.use(new Strategy(async (username, password, cb) => {
  try {
    let userData = await checkUser(username);

    //User Doenst Exist
    if (userData.rows.length === 0) {
      return cb(null, false);
    }

    const user = userData.rows[0];
    const match = await bcrypt.compare(password, user.password);

    // Hash Password matches the stored Hash Password
    if (match) {
      return cb(null, user);
    } else {
      return cb(null, false);
    }
  } catch (err) {
    return cb(err);
  }
}));


passport.serializeUser((user, cb) => {
  cb(null, user);
})
passport.deserializeUser((user, cb) =>{
  cb(null, user);
})

//listening to the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
