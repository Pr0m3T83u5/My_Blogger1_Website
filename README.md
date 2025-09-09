Welcome to my first website created entirely by me from scratch.

##Key Features====
⚙️ Runs on an Express.js server with EJS based dynamic webpages
🕹️ Connected with PostgreSQL(read further on how to create the database and join it with the server)

##Getting started
###Instructions to start the Website
Required: Have pgadmin 4(PostgreSQL) installed
1️⃣Create a new Database named word-for-word "B1ogger" under the user "postgres". Note that it is the number '1' instead of the small letter 'L' and other database and user names will also work as long as the index.js file constraints as are changed correspondingly.
2️⃣Under the same database run the following 2 queries individually and in order to create the required tables.
  CREATE TABLE users (id SERIAL PRIMARY KEY, user_name VARCHAR(100) NOT NULL UNIQUE, password VARCHAR(100) NOT NULL);
  CREATE TABLE blogs (id SERIAL PRIMARY KEY, blog_title VARCHAR(100) NOT NULL, blog_content TEXT NOT NULL, user_name VARCHAR(100) REFERENCES users.user_name);
3️⃣open index.js and change the client details for the SQL server accordingly. The code should be at the top of the file after the import and declarations. Only the password chosen by you for the server needs to be entered if the database name and username are the same as mentioned in Step-1.
4️⃣Run "npm i" command to install all dependencies.
5️⃣run the command 'node index.js'(or 'nodemon index.js') and open the website http://localhost:3000 as stated in the terminal.

##📢NOTE:
It is my first Website Project and will be regularly updated/patched as i gather more skills. The following points are state what is currently missing:
🚩Does not have any Security features yet
🚩Logged-in user can only see their own Blogs
🚩Does not have any APIs
🚩Does not support any Content-Management-System
🚩Does not automatically Create tables in SQL on launch yet
