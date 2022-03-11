// Require express library
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // Require body parser
app.use(bodyParser.urlencoded({extended: true}));
//const { cookie } = require("request");

// Set ejs as view engine
app.set("view engine", "ejs");

app.use(cookieParser());

// URL Databse
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//User Database
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// POST Requests

// Save new user to database
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {  // Check if email or password is empty string
    res.status(404).send("Email or Password cannot be empty");
  } else {
    let emailCheck = checkDuplicateEmail(req.body.email); // Check if email already exist's in users database    
    if (emailCheck === false) {
      const randomID = generateRandomString();
      users[randomID] = {id: randomID, email: req.body.email, password: req.body.password};
      res.cookie('user_id', randomID);
      res.redirect('/urls');
    } else {
      res.status(404).send("Email already exist!");
    }

  }
});

// Login Existing user
app.post("/login", (req, res) => {  
    if (req.body.email === "" || req.body.password === "") {  // Check if email or password is empty string
      res.status(404).send("Email or Password cannot be empty");
    } else { 
      let userID = checkDuplicateEmail(req.body.email); // Check if email/password match with database
      if(userID !== false){
        if(users[userID].password === req.body.password){
          res.cookie("user_id", userID);
          res.redirect('/urls');
        } else {
          res.status(403).send("Incorrect Password");
        }               
      } else {
        res.status(403).send("User does not exist. Please register first!");
      }
    }  
});

// Logout user and delete user_id cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});

//Add new longURLS and it's corresponding randomly generated short url in database using form
app.post("/urls", (req, res) => {
  let random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect(`/urls/${random}`);
});
 
// Delete Url and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// GET Requests

//Display all urls in browser
app.get("/urls", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_login", templateVars);
})

// Render the page to add new url's
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id]};
  res.render("urls_new", templateVars);
});

//To display single url and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { user: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Page Not Found');
  }
  
});

// Use shortUrl to redirect the page to its corresonding website (longUrl)
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {user: users[req.cookies.user_id], longURL: urlDatabase[req.params.shortURL] };
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    res.redirect(templateVars.longURL);
  } else {
    res.status(404).send('Page Not Found');
  }
});



app.listen(PORT, () => {
  console.log(`App listenig on port ${PORT}!`);
});

//Returns a string of 6 random alphanumeric characters
function generateRandomString() {
  let randomString = "";
  let letters = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    randomString += letters[Math.floor(Math.random() * letters.length)];
  }
  return randomString;
}

// Returns UserID if email already exist in users database else returns false
function checkDuplicateEmail(email) {
  for (const mail in users) {
    if (users[mail].email === email) {
      return users[mail].id;
    }
  }
  return false;
}