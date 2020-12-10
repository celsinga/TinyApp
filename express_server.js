const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// Cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());
// Databases
const urlDatabase = {

};
const userDatabase = { 

};
const emailFetcher = function() {
  for (let users in userDatabase) {
    return userDatabase[users].email;
  }
}
// Generate short URL
const generateRandomString = function() {
  const alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < alphaNum.length; i++) {
    if (result.length < 6) {
      result += alphaNum.charAt(Math.floor(Math.random() * alphaNum.length));
    }
  }
  return result;
};
// Registration page
app.get("/register", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user_id: user_id };
  res.render("register", templateVars);
});
app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let userInfo = {id, email, password};
  if (!email || !password) {
    return res.status(400).send( 'Email or password is empty');
  } else if (email === emailFetcher()) {
    return res.status(400).send('The email you entered is already in use');
  } else {
    userDatabase[id] = userInfo;
    res.cookie('user_id', id);
    return res.redirect('/urls');
  }
})
app.post("/reg", (req, res) => {
  res.redirect('/register');
});
app.post("/log", (req, res) => {
  res.redirect('/login');
});
app.get("/login", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { user_id: user_id };
  res.render("login", templateVars);
});
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let foundUser;
  for (const userId in userDatabase) {
    const user = userDatabase[userId];
    if (user.email === email && user.password === password) {
      foundUser = user;
      res.cookie('user_id', userDatabase[userId].id);
      res.redirect(`/urls`);
    } else if (user.email !== email || user.password !== password) {
      res.status(403).send('Incorrect email or password')
    }
  }
})
//Navbar Logged Out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/register');
});
//Create URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let long = req.body.longURL;
  let user_id = req.cookies["user_id"];
  let obj = {};
  obj["longURL"] = long;
  obj["userID"] = user_id;
  urlDatabase[shortURL] = obj;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});
//Main Page
app.get("/urls", (req, res) => {
  const user_id = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, users: userDatabase, user_id: user_id };
  res.render("urls_index", templateVars);
});
// Create New URL page render
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies["user_id"];
  if (user_id) {
    const templateVars = { users: userDatabase, user_id: user_id };
  res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
  
});
// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});
//Access URL Database
app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  const user_id = req.cookies["user_id"];
  const templateVars = { shortURL: shortURL, longURL: longURL, users: userDatabase, user_id: user_id };
  res.render("urls_show", templateVars);
});
//Update/edit URL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL;
  if (!req.body.longURL) {
    longURL = urlDatabase[shortURL];
    const user_id = req.cookies["user_id"];
    const templateVars = { shortURL: shortURL, longURL: longURL, users: userDatabase, user_id: user_id };
    res.render("urls_show", templateVars);
  } else {
    longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls`);
  }
});
// Redirect short URL to long URL site
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});
// Connection
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});