const getUserByEmail = function(email, database) {
  let user = {};
  for (let users in database) {
    if (email === database[users].email) {
      user = database[users];
    }
  }
  return user;
};


module.exports = getUserByEmail;