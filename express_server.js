const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
// Cookies
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
const getUserByEmail = require('./helpers.js');
// Databases
const urlDatabase = {

};
const userDatabase = {

};
//Access URL database
const urlsForUser = function(id) {
  let myUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      myUrls[shortURL] = {...urlDatabase[shortURL]};
    }
  }
  return myUrls;
};
// Generates short URL/user_id
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
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = { user_id: user_id };
    res.render("register", templateVars);
  }
});
// Registration form
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const pw = req.body.password;
  const password = bcrypt.hashSync(pw, 10);
  let userInfo = {id, email, password};
  const doesEmailExist = getUserByEmail(email, userDatabase);
  if (!email || !pw) {
    return res.status(400).send('Email or password is empty');
  } else if (email === doesEmailExist.email) {
    return res.status(400).send('The email you entered is already in use');
  } else {
    userDatabase[id] = userInfo;
    req.session.user_id = id;
    return res.redirect('/urls');
  }
});
//Register button
app.post("/reg", (req, res) => {
  res.redirect('/register');
});
//Login button
app.post("/log", (req, res) => {
  res.redirect('/login');
});
//Login page
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect("/urls");
  } else {
    const users = userDatabase;
    const templateVars = { users, user_id };
    res.render("login", templateVars);
  }
});
//Login form
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  console.log(userDatabase);
  for (const userId in userDatabase) {
    if (userDatabase[userId].email === email) {
      if (bcrypt.compareSync(password, userDatabase[userId].password)) {
        req.session.user_id = userDatabase[userId].id;
        res.redirect(`/urls`);
      } else {
        res.status(403).send('Incorrect password');
      }
    } else {
      res.status(403).send('Could not find a user with that email');
    }
  }
});
//Navbar Logged Out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/register');
});
//Create URL
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let long = req.body.longURL;
  let user_id = req.session.user_id;
  let obj = {};
  obj["longURL"] = long;
  obj["userID"] = user_id;
  urlDatabase[shortURL] = obj;
  res.redirect(`/urls/${shortURL}`);
});
//Main Page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const myURLs = urlsForUser(user_id);
  const templateVars = { urls: myURLs, users: userDatabase, user_id: user_id };
  res.render("urls_index", templateVars);
});
// Create New URL page render
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
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
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const longURL = urlDatabase[shortURL].longURL;
  if(urlDatabase[shortURL].userID === user_id){
    const templateVars = { shortURL: shortURL, longURL: longURL, users: userDatabase, user_id: user_id};
    res.render("urls_show", templateVars);
  } else{
    res.status(400).send('This URL can only be viewed by its user.');
  }
});
//Update/edit URL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL;
  const user_id = req.session.user_id;
  if (!req.body.longURL) {
    longURL = urlDatabase[shortURL].longURL;
    const templateVars = { shortURL: shortURL, longURL: longURL, users: userDatabase, user_id: user_id };
    res.render("urls_show", templateVars);
  } else {
    longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL, userID: user_id };
    res.redirect(`/urls`);
  }
});
// Redirect short URL to long URL site
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});
// Connection
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});