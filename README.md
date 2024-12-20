# Project Name: LinkyDinky

_A mashup of Imgur, Pastebin, and Bit.ly. Upload and share images, text, and shortened URLs effortlessly. Simplifying content sharing one link at a time._

---

## 1. Features

- **Image Hosting**: Upload and share images with a unique link.
- **Text/Code Sharing**: Share text or code snippets in a simple and readable format.
- **URL Shortening**: Convert long URLs into short, shareable links.
- **User-Friendly Interface**: Intuitive and easy-to-use platform for content sharing.

---

## 2. How to Use

1. **Upload Content**: Choose an image, text, or URL to share.
2. **Get a Short Link**: Receive a unique link to your content.
3. **Share**: Share the link with friends, colleagues, or on social media.

---

## 3.Techniques and Libraries

#### Frontend

- **HTML5**
- **CSS3**
- **EJS**
- **jQuery6**
- **tailwind**

#### Backend

- **Node.js**
- **Express.js**

#### Database

- **MongoDB**
- **MySQL**

---

## 4. Installation

### 4.1 Clone the repository:

```bash
git clone https://github.com/your-repo/LinkyDinky.git
```

### 4.2 Install dependencies

```bash
npm install
```

### 4.3 Session DB

1. Create a MongoDB account: [MongoDB Register](https://account.mongodb.com/account/register)
2. Set up a new database for session management

### 4.4 Configure Environment Variables

Create a `.env` file in the project's root directory and add the following variables:

```env
MONGODB_USER= //your own MongoDB account username
MONGODB_PASSWORD= //your own MongoDB account password
MONGODB_SESSION_SECRET= // your own MongoDB session secret, generate at https://guidgenerator.com/
NODE_SESSION_SECRET= // your own Node.js session secret, generate at https://guidgenerator.com/

MYSQL_USER= //your own FreeDB username
MYSQL_PASSWORD= //your own FreeDB password
MYSQL_HOST= //the name of your host
MYSQL_PORT= //your SQL port number
MYSQL_DATABASE= //your SQL DB Name

CLOUDINARY_CLOUD_NAME= //your own Cloudinary cloud name
CLOUDINARY_CLOUD_KEY= //your own Cloudinary API key
CLOUDINARY_CLOUD_SECRET= //your own Cloudinary API secret
```

### 4.4 Start Application

```bash
npm start
```

### 4.5 Access Application

Once the application has started successfully, you can access it in your web browser at http://localhost:3000 (or a different port if specified). By following these steps, you should be able to install and run the project locally on your machine. Make sure to review the project's documentation for any additional configuration or setup required for specific features or modules.

---

## 5. File Organization

```
Top level of project folder:
├── public                  # Public folder, containing necessary resources
├── routes                  # Routes folder, containting necessary resources
├── views                   # Views folder, containting ejs template views
├── .gitignore              # Gitignore file
├── README.md               # Readme file
├── databaseConnection.js   # databaseConnection.js file, allows us to connect to mongoDB
├── index.js                # index.js file, main js file to start app
├── package.json            # package file, includes dependencies for app to run
├── tailwind.config.js      # Configuration file for Tailwind CSS, defines custom styles, themes, and utility settings for the application
├── db_schema.jpg           # Configuration file for Tailwind CSS, defines custom styles, themes, and utility settings for the application
└── utils.js                # utils.js file, removes need to use /public

It has the following subfolders and files:
├── public                  # Public folder
|    ├── css                    # CSS folder
|    |    ├── style.css             # Main CSS file that includes Tailwind CSS for styling the application
|    |    └── tailwind.css          # Tailwind CSS core styles and utilities, typically generated during the build process
|    ├── images             # Images folder
|    |    └── logo.png                  # Source:  Modified or adapted by me.
|    ├── js                 # JavaScript folder
|    |    └── script.js                 # Basic JS file
|    ├── cloudinary-jquery.min.js       # Minified JavaScript library for integrating Cloudinary with jQuery, enabling image upload and management functionality
└── views                   # Views folder
     ├── templates              # Templates folder
     |    ├── footer.ejs                # EJS file for footer
     |    ├── header.ejs                # EJS file for header
     |    ├── navbar.ejs                # EJS file for navbar
     |    └── popup.ejs                 # EJS file for popup
     ├── 404.ejs                        # EJS file for 404 page
     ├── detail.ejs                     # EJS file for detail page
     ├── image.ejs                      # EJS file for image page
     ├── index.ejs                      # EJS file for index page
     ├── info.ejs                       # EJS file for info page
     ├── login.ejs                      # EJS file for login page
     ├── mypage.ejs                     # EJS file for mypage page
     ├── stats.ejs                      # EJS file for stats page
     ├── upload.ejs                     # EJS file for upload page
     └── signUp.ejs                     # EJS file for sign up page
```
