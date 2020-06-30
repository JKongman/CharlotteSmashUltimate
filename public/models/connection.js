// DEFINE MONGOOSE
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// SCHEMA TO HOLD CONNECTION INFORMATION
var connectionSchema = new Schema({
    cid: {type: String, required: true},
    name: {type: String, required: true},
    topic: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    location: {type: String, required: true},
    details: {type: String, required: true},
    image: {type: String, required: false},
    hostid: {type: String, required: true}
});

module.exports = mongoose.model('connection', connectionSchema, 'connections');
