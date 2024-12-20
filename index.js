require("./utils");
require("dotenv").config();

const express = require("express");

// Session management
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Multer for file uploads
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const uploadDir = path.join(__dirname, "/public/profile");

// Hash passwords using BCrypt
const bcrypt = require("bcrypt");
const saltRounds = 12;

// shorten url
const shortid = require("shortid");

//db connection
const database = include("databaseConnection");
const db_utils = include("database/db_utils");
const create_tables = include("database/create_tables");
const db_users = include("database/db_users");
const db_contents = include("database/db_contents");
const success = db_utils.printMySQLVersion();

//reference of the express module
const app = express();

const expireTime = 24 * 60 * 60 * 1000; //expires after 1 day  (hours * minutes * seconds * millis)

/* secret information section */
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

const crypto = require("crypto");
const { v4: uuid } = require("uuid");
// const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const cloudinary = require("cloudinary");
// const e = require("express");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

// Multer setting
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@cluster0.ttibm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
  crypto: {
    secret: mongodb_session_secret,
  },
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 3600000, // 1 hour in milliseconds
    },
    autoRemove: "interval",
    autoRemoveInterval: 60, // Sessions older than 1 hour will be removed every minute
    encrypt: true, // Enable encryption for session data (this is usually the default)
  })
);

// Using middleware to pass session data to views
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.authenticated = req.session.authenticated || false;
  next();
});

function isValidSession(req) {
  if (req.session.authenticated) {
    return true;
  }
  return false;
}

function sessionValidation(req, res, next) {
  if (!isValidSession(req)) {
    req.session.destroy();
    res.redirect("/login");
    return;
  } else {
    next();
  }
}

// Home
app.get("/", async (req, res) => {
  const isAuthenticated = req.session.authenticated || false;
  const uploadedContents = await db_contents.getUploadedContents();
  //when user is not logged in
  if (!isAuthenticated) {
    res.render("index", { authenticated: false, user: null, uploadedContents });
    //when user is logged in
  } else {
    const username = req.session.username;
    res.render("index", {
      authenticated: isAuthenticated,
      user: { username },
      uploadedContents,
    });
  }
});

// signup : signup path
app.get("/signup", (req, res) => {
  res.render("signup");
});

// app.get("/signingUpStart", (req, res) => {
//   var missingFields = req.query.missingFields;
//   var invalidFields = req.query.invalidPassword;

//   if (missingFields) {
//     res.render("signup", { missingFields: true });
//   } else if (invalidFields) {
//     res.render("signup", { invalidFields: true });
//   } else {
//     res.render("signup");
//   }
// });

// app.use("/createTables", sessionValidation);
app.get("/createTables", async (req, res) => {
  try {
    let success = await create_tables.createTables(); // Ensure you're awaiting the async function

    if (success) {
      res.send("Created tables.");
    } else {
      res.send("Failed to create tables.");
    }
  } catch (err) {
    console.error("Error in /createTables route", err);
    res.status(500).send("An error occurred while creating tables.");
  }
});

// signingUp
app.post("/signingUp", async (req, res) => {
  const { email, username, password } = req.body;

  // Input validation
  if (!email || !username || !password) {
    return res.status(500).send("Please fill in all required fields.");
  }

  // Password validation >= 10 characters with upper/lowercase, numbers, symbols
  const regexUpper = /[A-Z]/;
  const regexLower = /[a-z]/;
  const regexNumber = /[0-9]/;
  const regexSymbol = /[$&+,:;=?@#|'<>.^*()%!-]/;

  if (
    password.length >= 10 &&
    regexUpper.test(password) &&
    regexLower.test(password) &&
    regexNumber.test(password) &&
    regexSymbol.test(password)
  ) {
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // Try creating the user
    const success = await db_users.createUser({
      email,
      username,
      hashedPassword,
      profile: null,
    });

    if (success) {
      req.session.authenticated = true;
      req.session.username = username;
      req.session.cookie.maxAge = expireTime;

      return res.status(200).send("Successfully created user.");
    } else {
      return res.status(500).send("Username or Email already exists.");
    }
  } else {
    // Password does not meet requirements
    return res
      .status(500)
      .send("Invalid password. Must meet complexity requirements.");
  }
});

// Login
app.get("/login", (req, res) => {
  res.render("login");
});

// Logging in
app.post("/loggingin", async (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  try {
    var results = await db_users.getUser({
      username: username,
    });

    if (results && results.length === 1) {
      // there should only be 1 user in the db that matches
      if (bcrypt.compareSync(password, results[0].password_hash)) {
        req.session.authenticated = true;
        req.session.username = username;
        req.session.user_id = results[0].user_id;
        req.session.profile_img = results[0].profile_img;
        req.session.cookie.maxAge = expireTime;
        return res.status(200).send("Login success");
      } else {
        return res.status(404).send("Invalid username or password");
      }
    } else {
      return res.status(404).send("Invalid username or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Server error");
  }
});

// Log out
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Upload
app.use("/upload", sessionValidation);
app.get("/upload", (req, res) => {
  res.render("upload", { user: req.session.username });
});

// Upload link
app.use("/upload-link", sessionValidation);
app.post("/upload-link", async (req, res) => {
  var url = req.body.url;

  // Validate the URL (basic validation)
  // const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  // if (!urlRegex.test(url)) {
  //   return res.status(400).send("Invalid URL");
  // }

  //make short URL
  const shortId = shortid.generate();
  const shortUrl = `${shortId}`;

  // Assume you have a function in db.content.js to insert into the content table
  const user_id = req.session.user_id; // Assuming you're using sessions to track user

  try {
    await db_contents.insertLink({
      user_id: user_id,
      type: "link",
      original_url: url,
      short_url: shortUrl,
    });
    console.log("Link Submitted:", url);
    return res.redirect("/");
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Error saving link to database");
  }
});

app.use("/upload-text", sessionValidation);
app.post("/upload-text", async (req, res) => {
  var textInput = req.body.textInput;

  const originalUrl = `/text/${uuid()}`;
  // Placeholder for short URL (no implementation yet)
  const shortUrl = shortid.generate();

  // Assume you have a function in db.content.js to insert into the content table
  const user_id = req.session.user_id; // Assuming you're using sessions to track user

  try {
    await db_contents.insertText({
      user_id: user_id,
      type: "text",
      text: req.body.textInput,
      original_url: originalUrl,
      short_url: shortUrl,
    });
    console.log("Text Submitted:", textInput);
    return res.redirect("/");
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Error saving link to database");
  }
});

app.use("/stats", sessionValidation);
app.get("/stats", async (req, res) => {
  const username = req.session.username;
  // default type is link
  const type = req.query.type || "link";
  let items = [];

  try {
    if (type === "text") {
      items = await db_contents.getTextContentByUser({
        username: username,
        type: type,
      });
    } else {
      items = await db_contents.getContentsByTypeAndUser({
        username: username,
        type: type,
      });
    }

    res.render("stats", { items, type });
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).send("Error fetching contents");
  }
});

//Mypage
app.use("/mypage", sessionValidation);
app.get("/mypage", async (req, res) => {
  // Check if the user is logged in by verifying the session username
  var username = req.session.username;

  // console.log("Session username:", req.session.username);
  if (!username) {
    return res.redirect("/login");
  }

  try {
    // Fetch user info from the database using the username
    const user = await db_users.getUserByUsername({ username: username }); // Assuming this returns user details including email
    if (!user) {
      return res.status(500).send("User not found");
    }

    // Render the MyPage with the username and email from the database
    res.render("mypage", {
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).send("Error retrieving user info");
  }
});

app.post("/updateEmail", async (req, res) => {
  var newEmail = req.body.newEmail;
  var username = req.session.username;
  try {
    const existingUser = await db_users.getUserByEmail({ email: newEmail });
    console.log("Existing User:", existingUser);

    if (existingUser && existingUser.username !== username) {
      return res
        .status(400)
        .send("This email is already in use by another user.");
    }

    if (existingUser && existingUser.username == username) {
      return res.status(400).send("You are already using this email.");
    }

    await db_users.updateEmail({ username: username, email: newEmail });
    res.status(200).send("Email updated successfully!");
  } catch (error) {
    console.error("Error updating email:", error);
    return res.status(500).send("Error updating email");
  }
});

app.post("/updatePassword", async (req, res) => {
  const username = req.session.username;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  try {
    const user = await db_users.getUserByUsername({ username: username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).send("Current password is incorrect.");
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send("New passwords do not match.");
    }

    // 4. 새 비밀번호가 현재 비밀번호와 다른지 확인
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return res
        .status(400)
        .send("New password cannot be the same as the current password.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db_users.updatePassword({
      username: username,
      password_hash: hashedPassword,
    });

    if (result) {
      res.status(200).send("Password updated successfully.");
    } else {
      res.status(500).send("Failed to update password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error.");
  }
});

// Upload image
app.use("/upload-image", sessionValidation);
app.post("/upload-image", upload.single("file-upload"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  let image_uuid = uuid();
  let buf64 = req.file.buffer.toString("base64");

  try {
    const result = await cloudinary.uploader.upload(
      "data:image/octet-stream;base64," + buf64,
      { public_id: image_uuid }
    );

    if (!result.secure_url) {
      return res.render("error", {
        message: "Error uploading the image to Cloudinary",
      });
    }

    // make short URL
    const shortId = shortid.generate();
    const shortUrl = `${shortId}`;

    const success = await db_contents.insertImage({
      username: req.session.username,
      type: "image",
      original_url: result.secure_url,
      short_url: shortUrl,
    });

    if (success) {
      console.log("The image uploaded successfully");
      res.redirect("/");
    } else {
      res.status(500).send("Error saving the image to database");
    }
  } catch (error) {
    console.error("Error:", error);
    if (error.message.includes("Database")) {
      res.render("error", { message: "Error connecting to Database" });
    } else {
      res.status(500).send("Error uploading the image");
    }
  }
});

app.use("/update-status", sessionValidation);
app.post("/update-status", async (req, res) => {
  const content_id = req.body.content_id;
  const is_active = req.body.is_active;

  console.log("Content ID:", content_id);
  console.log("Is Active:", is_active);

  try {
    await db_contents.updateContentStatus({
      content_id: content_id,
      is_active: is_active,
    });
    return res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Database update failed" });
  }
});

app.use("/detail", sessionValidation);
app.get("/detail", async (req, res) => {
  const contentId = req.query.content_id;

  try {
    const result = await db_contents.updateContentStatus({
      content_id: contentId,
    });

    if (result) {
      res.render("detail", { result });
    } else {
      res.status(500).send("Error saving the image to database");
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Database update failed" });
  }
});

app.get("/search", async (req, res) => {
  const { type, searchText } = req.query;

  try {
    const result = await db_contents.searchText({
      type: type,
      text: searchText,
    });

    if (result) {
      console.log(result);
      res.json({ result });
    } else {
      res.status(500).send("Error revoking the text from database");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// View shortUrl
// app.get("/:shortUrl", async (req, res) => {
//   var shortUrl = req.params.shortUrl;
//   const type = req.query.type;
//   let content = [];

//   try {
//     if (type === "text") {
//       content = await db_contents.getTextContentByShortUrl({
//         short_url: shortUrl,
//       });
//     } else {
//       content = await db_contents.getContentByShortUrl({
//         short_url: shortUrl,
//       });
//     }

//     if (content) {
//       await db_contents.updateHit({ short_url: content.short_url });
//       return res.render("info", {
//         content: content,
//       });
//     } else {
//       return res.sendStatus(404);
//     }
//   } catch (error) {
//     console.error("Error retrieving content from database:", error);
//     return res.sendStatus(500);
//   }
// });

// View shortUrl
app.get("/info/:type/:shortUrl", async (req, res) => {
  var shortUrl = req.params.shortUrl;
  const type = req.params.type;
  let content = [];

  console.log("shortUrl:", shortUrl);
  console.log("type:", type);

  try {
    if (type === "text") {
      content = await db_contents.getTextContentByShortUrl({
        short_url: shortUrl,
      });
    } else {
      content = await db_contents.getContentByShortUrl({
        short_url: shortUrl,
      });
    }

    if (content) {
      await db_contents.updateHit({ short_url: content.short_url });
      return res.render("info", {
        content: content,
      });
    } else {
      return res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error retrieving content from database:", error);
    return res.sendStatus(500);
  }
});

// Serve static files
app.use(express.static(__dirname + "/public"));

//  Catch all other routes and 404s
app.get("*", (req, res) => {
  res.status(404);
  // res.send("Page not found - 404");
  res.render("404");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
