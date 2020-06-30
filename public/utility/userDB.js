// DEFINE MONGOOSE
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/smashDB');

// Define User model
var user = require('../models/user');

// GET ALL USERS
module.exports.getAllUsers = async function(){
  var users = await user.find()
  return users;
}
// GET USER
module.exports.getUser = async function(userID){
  var oneUser = await user.findOne({ uid: userID })
  return oneUser;
}
// GET USERNAME
module.exports.getUserName = async function(uname){
  console.log("Checking username in DB");
  var uName = await user.findOne({ username: uname })
  if(uName == null){
    console.log("user with given username was not found");
    return null;
  }
  return uName.username;
};

// GET PASSWORD
module.exports.getUserPassword = async function(uname ,pw){
  console.log("Checking password in DB");
  var pass = await user.findOne({ username:uname, password: pw });
  if(pass == null){
    console.log("user with given username and password was not found");
    return null;
  }
  return pass.password;
};

// GET USER THROUGH USERNAME
module.exports.getUserFromUsername = async function(uname){
  var oneUser = await user.findOne({ username: uname });
  return oneUser;
};

// ADDING NEW USER
module.exports.addingNewUser = async function (newUser) {
  await user.insertMany(newUser);
};

// CHECK EMAIL
module.exports.checkEmail = async function(email){
  var check = await user.findOne({emailAddress:email});
  if(check == null){
    console.log("email not found");
    return null;
  }
  console.log("Email found");
  return check.email;
};

// GET USER FROM ID
module.exports.getUserFromID = async function(userID){
  var oneUser = await user.findOne({ uid: userID });
  return oneUser;
};