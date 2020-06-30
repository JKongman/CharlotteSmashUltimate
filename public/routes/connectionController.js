// Define Express, Router, and Information for user
var express = require('express');
var router = express.Router();
var information = require("../utility/connectionDB");
var userInformation = require("../utility/userDB");

// INDEX
router.get('/', function (req, res){
  res.render('index', { theUser: req.session.theUser });
});

router.get('/index', function (req, res){
  res.render('index', { theUser: req.session.theUser });
});

// ABOUT
router.get('/about', function (req, res){
  res.render('about', { theUser: req.session.theUser });
});

// CONNECTIONS
router.get('/connections', async function (req, res){
  var data = await information.getConnections();
  var topics = await information.getConnectionTopics();
  res.render('connections', {
    cID: data, topics: topics, theUser: req.session.theUser
  });
});

// CONNECTION NAME + ID
router.get('/connection/:id', async function (req, res){
  var dataID = await information.getConnection(req.params.id);
  var user = await userInformation.getUser(dataID[0].hostid);
  if(dataID){
    res.render('connection', {
      cID: dataID, theHost: user.firstName, theUser: req.session.theUser
    });
  } else {
    var data = await information.getConnections();
    res.render('connections', {
      cID: data, theUser: req.session.theUser
    });
  }
});

// CONTACT
router.get('/contact', function (req, res){
  res.render('contact', { theUser: req.session.theUser });
});

// NEW CONNECTION
router.get('/newConnection', function (req, res){
  res.render('newConnection', { theUser: req.session.theUser });
});

// ROUTE CHECKER
router.get('/*', function (req, res){
  res.send('No information available');
});

module.exports = router;
