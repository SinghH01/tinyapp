// Require express library
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// Require body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// Set ejs as view engine
app.set("view engine", "ejs");


// URL Databse Object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Send "Hello" to browser when in homepage (root path)
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Render "/urls" and pass data
app.get("/urls", (req, res) => {
  const tempelateVars = {urls: urlDatabase};
  res.render("urls_index", tempelateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
});

// GET route to render the urls_new.ejs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//To display single url and its shortened form
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});



// Send JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Send HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`App listenig on port ${PORT}!`);
});

//Returns a string of 6 random alphanumeric characters
function generateRandomString() {
  let randomString = "";  
  let letters ='abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for(let i = 0; i < 6; i++) {    
     randomString += letters[Math.floor(Math.random() * letters.length)];
  }
  return randomString;
}