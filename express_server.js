// Require express library
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// URL Databse Object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Send "Hello" to browser when in homepage (root path)
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Send JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`App listenig on port ${PORT}!`);
});

