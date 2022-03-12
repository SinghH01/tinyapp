// Require required libraries
const cookieSession = require('cookie-session')
const express = require("express");
const bodyParser = require("body-parser"); // Body parser
const bcrypt = require('bcryptjs'); //Hashing password
// Set ejs as view engine
app.set("view engine", "ejs");

const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
}))

// URL Databse
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  },
  b6UTxA: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  b6UTxB: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
};

//User Database
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "p"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// POST REQUESTS

// Save new user to database
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {  // Check if email or password is empty string
    res.status(404).send("Email or Password cannot be empty");
  } else {
    let emailCheck = userByEmail(req.body.email); // Check if email already exist's in users database
    if (emailCheck === false) {
      const randomID = generateRandomString();
      users[randomID] = {id: randomID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) }; // Hashing password
      req.session.user_id = randomID;    
      res.redirect('/urls');
    } else {
      res.status(404).send("Email already exist!");
    }
  }
});

// Login User
app.post("/login", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {  // Check if email or password is empty string
    res.status(404).send("Email or Password cannot be empty");
  } else {
    let userID = userByEmail(req.body.email); // Check if email/password match with database
    if (userID !== false) {
      //Check if encrytped password matches the password entered by user
      if (bcrypt.compareSync(req.body.password, users[userID].password)) {        
        req.session.user_id = userID;
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
  req.session = null;
  res.redirect('/urls');
});

//Add new longURLS and it's corresponding randomly generated short url in database using form
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let random = generateRandomString();
    urlDatabase[random] = {longURL: req.body.longURL, userID: req.session.user_id};    
    res.redirect(`/urls/${random}`);
  } else {
    res.status(401).send("Error 401: Unauthorized");
  }
});
 
// Delete Url and redirect to urls page
app.post("/urls/:shortURL/delete", (req, res) => {
  let filteredObject = urlsForUser(req.session.user_id);
    if(filteredObject[req.params.shortURL]) { 
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.status(401).send('Not authorized to delete this');
    }
});

// Edit url
app.post("/urls/:shortURL/edit", (req, res) => {
  let filteredObject = urlsForUser(req.session.user_id);
    if(filteredObject[req.params.shortURL]) { 
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(401).send('Not authorized to edit this');
    }

});

// GET REQUESTS

//Display all urls in browser
app.get("/urls", (req, res) => {
  if(req.session.user_id) {
    let filteredObject = urlsForUser(req.session.user_id);
    const templateVars = {user: users[req.session.user_id], urls: filteredObject};   
    res.render("urls_index", templateVars);
  } else {
    res.status(404).send('Login or register first');
  }
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {    
    res.redirect("/urls");
  } else {
    const templateVars = {user: users[req.session.user_id]};
    res.render("urls_login", templateVars);
  }
});

// Render the page to add new url's
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {user: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls");
  }

});

//To display single url and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    //Only show the page(url) to logged in user
    let filteredObject = urlsForUser(req.session.user_id);
    if(filteredObject[req.params.shortURL]) {
      const templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: filteredObject[req.params.shortURL].longURL };
      res.render("urls_show", templateVars);
    } else {
      res.status(404).send('Please login or register first!');
    }
  } else {
    res.status(404).send('URL does not exist!');
  }  
});

// Use shortUrl to redirect the page to its corresonding website (longUrl)
app.get("/u/:shortURL", (req, res) => {
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    const templateVars = {user: users[req.session.user_id], longURL: urlDatabase[req.params.shortURL].longURL };
    res.redirect(templateVars.longURL);
    //Return error message if the id does not exist
  } else {
    res.status(404).send('ID does not exist');
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
function userByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
}

function urlsForUser(id) {
  let userUrls = {};
  for(const item in urlDatabase) {      
    if(urlDatabase[item].userID === id){
      userUrls[item] = {longURL: urlDatabase[item].longURL};            
    }
  }
  return userUrls; 
}