const getUserByEmail = function(email, database) {
  let user = {};
  for (let users in database) {
    if (email === database[users].email) {
      user = database[users];
    }
  }
  return user;
};

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

module.exports = getUserByEmail;
module.exports = generateRandomString;