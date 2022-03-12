//HELPER FUNCTIONS

// Returns UserID if email already exist in users database else returns false
function getUserByEmail(email, database) {
  let userID;
  for (const user in database) {
    if (database[user].email === email) {
      userID = database[user].id;
    }
  }
  return userID;
}

//Returns a string of 6 random alphanumeric characters
function generateRandomString() {
  let randomString = "";
  let letters = 'abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let i = 0; i < 6; i++) {
    randomString += letters[Math.floor(Math.random() * letters.length)];
  }
  return randomString;
}

// Returns URLs from a specific user based on his user ID
function urlsForUser(id, database) {
  let userUrls = {};
  for (const item in database) {
    if (database[item].userID === id) {
      userUrls[item] = {longURL: database[item].longURL};
    }
  }
  return userUrls;
}

module.exports = {getUserByEmail, generateRandomString, urlsForUser};