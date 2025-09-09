# 📝 My Blogger1 Website

Welcome to my first website created entirely by me from scratch.

## Key Features
- ⚙️ Runs on an Express.js server with EJS-based dynamic webpages
- 🕹️ Connected with PostgreSQL (read further on how to create the database and join it with the server)

## Getting Started

### Instructions to Start the Website
**Required:** Have pgAdmin 4 (PostgreSQL) installed

1. **Create a Database**  
   In pgAdmin, create a new database named **B1ogger** (note the number `1` instead of letter `l`) under the user `postgres`.

2. **Create Tables**  
   Run the following SQL queries:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     user_name VARCHAR(100) NOT NULL UNIQUE,
     password VARCHAR(100) NOT NULL
   );
   CREATE TABLE blogs (
     id SERIAL PRIMARY KEY,
     blog_title VARCHAR(100) NOT NULL,
     blog_content TEXT NOT NULL,
     user_name VARCHAR(100) REFERENCES users(user_name)
   );
   ```

3. **Configure Database Connection**  
   Open `index.js` and change the client details for your SQL server.

4. **Install Dependencies**
   ```bash
   npm i
   ```

5. **Run the App**
   ```bash
   node index.js
   # or
   nodemon index.js
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📢 NOTE
This is my first website project and will be regularly updated as I gather more skills.

### Missing Features
- 🚩 No security features yet
- 🚩 Logged-in user can only see their own blogs
- 🚩 No APIs
- 🚩 No CMS support
- 🚩 No automatic table creation on launch yet
