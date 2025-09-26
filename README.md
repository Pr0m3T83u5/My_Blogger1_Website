<a id="readme-top"></a>




<!-- Heading -->
# 📝 My Blogger1 Website

Welcome to my first website created entirely by me from scratch. The only purpose of this Website is to showcase my abilities and skills in Web-development. In this Project I have created a minimal Blog website where users can register themselves and write, edit and delete their blogs. The passwords are encrypted using bcrypt and the database used is a local PostgreSQL server. Below you may find the tools used to built this website with and its key features. To jump to the installation and configuration process, please click on this <a href="#Installation">link </a>
### Built With
*  [Jquery](https://jquery.com/)
*  [ExpressJS](https://expressjs.com/)
*  [EJS](https://ejs.co/)
*  [PostgreSQL](https://www.postgresql.org/)
*  [Bcrypt](https://www.npmjs.com/package/bcrypt)
*  [PassportJS](https://www.passportjs.org/)

## Key Features
- ⚙️ Runs on an Express.js server with EJS-based dynamic webpages
- 🕹️ Connected with PostgreSQL (read further on how to create the database and join it with the server)
- 🔐 Uses Bcrypt to "hash and salt" encrypt user passwords
- 🔐 Authentication is done by a local Stratergy via PassportJS
- 👨‍💻 Uses dotenv to create environment variables
  
  <p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- Setting up the project -->
<a id="Installation"> </a>
## Getting Started

### Prerequisites
*  Have pgAdmin 4 (PostgreSQL) installed

### Instructions to Start the Website
1. **Create a Database**  
   In pgAdmin, create a new database.

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
3. Clone the repo
   ```sh
   git clone https://github.com/Pr0m3T83u5/My_Blogger1_Website
   ```
4. Change git remote url to avoid accidental pushes to base project
   ```sh
   git remote set-url origin Pr0m3T83u5/My_Blogger1_Website
   git remote -v # confirm the changes
   ```

5. **Install Dependencies**
   ```bash
   npm i
   ```

6. **Configure Database Connection**  
   2 Options:
   a)(without a .env file) Change the following configuration data(below) in the index.js file with the details of your Database and add a session key
   b)Create an dotenv(.env) file and define the following data with the required values
   ```bash
   process.env.SQL_USER
   process.env.SQL_HOST
   process.env.SQL_DB_NAME
   process.env.SQL_PASSWORD
   process.env.SQL_PORT
   process.env.SESSION_SECRET
   ```

7. **Run the App**
   ```bash
   node index.js
   # or
   nodemon index.js
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

   <p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Note -->
## Roadmap
- [x] Database functionality
- [ ] Security Features
    - [x] Only logged-in users can edit/delete their own blogs
    - [x] Users need to log-in to create a blog
    - [x] Access restriction using the Web-search bar
- [ ] Logged-in user have option to see only their own blogs or all the blogs
- [ ] Add API functionality
- [ ] Add Content-Management-System support

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- Acknowledgements -->
## Acknowledgments

* [Best-README-template](https://github.com/othneildrew/Best-README-Template?tab=readme-ov-file)
* [App Brewary Complete-Web-Dev Course](https://www.appbrewery.com/p/the-complete-web-development-course)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
