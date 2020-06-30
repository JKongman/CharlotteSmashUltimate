// DEFINE MONGOOSE
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/smashDB');
var Connection = require('../models/connection');
var userConnection = require('../models/userConnection');

// GET USER PROFILE
module.exports.getUserProfile = async function(userID){
    var userProfile = await userConnection.find({ uidRSVP: userID });
    return userProfile;
}
// ADD RSVP
module.exports.addRSVP = async function(connectionID, userID, rsvp){
    var newCon = await Connection.findOne({ cid: connectionID });
    await userConnection.insertMany({ cid: connectionID, connection: newCon, uidRSVP: userID, rsvp: rsvp });
}
// UPDATE RSVP
module.exports.updateRSVP = async function(connectionID, userID, rsvp){
    await userConnection.findOneAndUpdate({ cid: connectionID, uidRSVP: userID }, { rsvp: rsvp });
}
// ADD CONNECTION
module.exports.addConnection = async function(connection){
    await Connection.insertMany(connection);
}
// REMOVE CONNECTION
module.exports.removeConnection = async function(id, userID){
    await userConnection.findOneAndDelete({ cid: id, uidRSVP: userID });
}

// DELETE ALL RSVPS
module.exports.deleteAllRSVPs = async function(connectionID){
    await userConnection.deleteMany({ cid: connectionID });
};