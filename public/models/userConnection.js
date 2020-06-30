// DEFINE MONGOOSE
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// SCHEMA TO HOLD USERPROFILE CONNECTIONS
var userConnectionSchema = new Schema({
  cid: {type: Number, required: true},
  connection: {
    cid: {type: String, required: true},
    name: {type: String, required: true},
    topic: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    location: {type: String, required: true},
    details: {type: String, required: true},
    image: {type: String, required: false},
    hostid: {type: String, required: true}
  },
  rsvp: {type: String, required: true},
  uidRSVP: {type: String, required: true}
});

module.exports = mongoose.model('UserConnection', userConnectionSchema, 'userConnections');