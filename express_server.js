// Require express library
const express = require("express");
const app = express();
const PORT = 3001; // default port 8080

// Require body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set ejs as view engine
app.set("view engine", "ejs");


// URL Databse Object
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


//Display all urls in browser
app.get("/urls", (req, res) => {
  const tempelateVars = {urls: urlDatabase};
  res.render("urls_index", tempelateVars);
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

// Render the page to add new url's
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//To display single url and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //If a client requests a non-existent shortURL
  if (urlDatabase[req.params.shortURL]) {
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send('Page Not Found');
  }
  
});

// Use shortUrl to redirect the page to its corresonding website (longUrl)
app.get("/u/:shortURL", (req, res) => {
  const templateVars = {longURL: urlDatabase[req.params.shortURL] };
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