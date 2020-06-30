// DEFINE MONGOOSE
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/smashDB');
// Define Connection and UserConnection
var Connection = require('../models/connection');
var userConnection = require('../models/userConnection');

// Get All Connections
module.exports.getConnections = async function(){
  var conns = await Connection.find();
  return conns;
}
// Get Connection Topic
module.exports.getConnectionTopics = async function(){
  var topics = await Connection.distinct("topic");
  return topics;
}
// Get a Connection
module.exports.getConnection = async function(connID){
  var conn = await Connection.find( {cid: connID} );
  return conn;
}

// User Created Connections
module.exports.getCreatedConnections = async function(userid){
  var conns = await Connection.find( {hostid: userid} );
  return conns;
};

// Delete Connection from Database
module.exports.deleteConnection = async function(connID){
  await Connection.findOneAndDelete( {cid: connID} );
};

// Update Connection
module.exports.updateConnection = async function(connID, newConn){
  await Connection.findOneAndReplace( {cid: connID}, {cid: newConn.cid, name: newConn.name, topic: newConn.topic, date: newConn.date, time: newConn.time, location: newConn.location, details: newConn.details, hostid: newConn.hostid} );
  if (await userConnection.findOne( {cid: connID} ) != null){
    await userConnection.updateMany( {cid: connID}, {connection: newConn});
  }
};