// DEFINE MONGOOSE
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// SCHEMA TO HOLD USER INFORMATION
var userSchema = new Schema ({
  uid: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  emailAddress: {type: String, required: true},
  username: {type: String, required: true},
  password: {type: String, required: true}
});

module.exports = mongoose.model('User', userSchema, 'users');