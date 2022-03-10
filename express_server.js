// Require express library
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

// Require body parser
const bodyParser = require("body-parser");
const { cookie } = require("request");
app.use(bodyParser.urlencoded({extended: true}));

// Set ejs as view engine
app.set("view engine", "ejs");

app.use(cookieParser());

// URL Databse Object
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Display all urls in browser
app.get("/urls", (req, res) => {
  const tempelateVars = {username: req.cookies.username, urls: urlDatabase};
  res.render("urls_index", tempelateVars);
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username)  
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {  
  res.clearCookie("username");
  res.redirect('/urls');
})

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

// Render the page to add new url's
app.get("/urls/new", (req, res) => {
  const tempelateVars = {username: req.cookies.username}
  res.render("urls_new", tempelateVars);
});

//To display single url and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies.username, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Page Not Found');
  }
  
});

// Use shortUrl to redirect the page to its corresonding website (longUrl)
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {username: req.cookies.username, longURL: urlDatabase[req.params.shortURL] };
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