// Define Express
var express = require('express');
var router = express.Router();

// Defime User/Connection Models & User Hardcode(DB)
var Connection = require('../models/connection');
var User = require('../models/user');
var UserDB = require("../utility/userDB");
var ConnectionDB = require('../utility/connectionDB');
var UserConnectionDB = require('../utility/userConnectionDB');

// Define Validation
var { check, validationResult } = require('express-validator');
//var bcrypt = require('bcrypt');

// Define Session
var session = require('express-session');
var cookieParser = require('cookie-parser');

router.use(session({ secret: "secrect", resave: true, saveUninitialized: true }));
router.use(cookieParser());


// NEW CONNECTION
router.get('/newConnection', function (req, res) {
  res.render('newConnection', { theUser: req.session.theUser });
});

// SAVED CONNECTIONS
router.get('/savedConnections', function (req, res) {
  if (!req.session.theUser) {
    res.render('login');
  } else {
    res.render('savedConnections', {
      data: req.session.userProfile,
      events: req.session.hostedItems,
      theUser: req.session.theUser
    });
  }
});

// SIGN UP
router.get('/signup', function (req, res) {
  res.render('signup', {
    theUser: req.session.theUser, error: null
  });
});

// ROUTER GET FUNCTION
router.get('/', [check('username').isAlphanumeric().isLength({ min: 4 }).withMessage("Username should be at least 4 characters long"),
check('password').isAlphanumeric().isLength({ min: 4 }).withMessage("Password should contain only lower case letter and numbers with a minimum length of 4 characters")],
  async function (req, res) {

    // Define to Hold An Error Message
    var errMsg = null;
    console.log("-- Router.GET for session checking --");
    
    // Define to Hold Action & Get Action from query
    var action = req.query.action;
    console.log("-- Router.GET action: " + action + " --");

    // Action: Sign In
    if (action == "signin") {
      res.render("login", { error: errMsg });

      // Action: Sign Out
    } else if (action == "signout") {
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect('index');
        }
      });

      // Action: Login
    } else if (action == "login") {
      
      // Error Validator
      var errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      if (!req.session.loggedIn) {
        // Set Username and Password from query and set into u1 & p1
        var u1 = req.query.username;
        var p1 = req.query.password;

        // Checks Matching Username in database
        if (req.query.username == await UserDB.getUserName(u1)) {
          console.log("username is valid");

          // Checks Matching Password in database
          if (req.query.password == await UserDB.getUserPassword(u1, p1)) {
            console.log("password given for username is valid");
            
            // Sets loggedIn to true
            req.session.loggedIn = true;
            // Gets the User from the Username in the database
            req.session.theUser = await UserDB.getUserFromUsername(u1);
            // Sets userNum as the user ID
            var userNum = req.session.theUser.uid;
            // Gets the user connection and set the userProfile into session
            req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);
            // Set userProfile session into userProfile
            var userProfile = req.session.userProfile;
            // Array for userConnections
            var userConnections = [];
            for (i in userProfile) {
              userConnections.push(userProfile[i].connection);
            }

            // Set userConnections and Get Created ConnectionsSession userItems & hostedItems
            req.session.userItems = userConnections;
            req.session.hostedItems = await ConnectionDB.getCreatedConnections(userNum);
            
            // Render savedConnections
            res.render('savedConnections', {
              data: req.session.userProfile,
              events: req.session.hostedItems,
              theUser: req.session.theUser
            });
          } else {
            // Error handler for password
            console.log("password is not valid");
            errMsg = "Password is not valid";
            res.render("login", { error: errMsg });
          }
        } else {
          // Error handler for username
          console.log("username is not valid");
          errMsg = "Username is not valid";
          res.render("login", { error: errMsg });
        }
      } else {
        // Logs session started
        console.log("Session has already started");
      }
    }
  });



// Sign Up Method & Validator
router.post('/signup', [check('firstName').isAlpha().isLength({ min: 2 }).withMessage("First name should only consist of letters"),
check('lastName').isAlpha().isLength({ min: 2 }).withMessage("Last name should only consist of letters"),
check('emailAddress').isEmail().withMessage("Must be a valid email address"),
check('username').isAlphanumeric().isLength({ min: 4 }).withMessage("Username should be at least 4 characters long"),
check('password').isAlphanumeric().isLength({ min: 4 }).withMessage("Password should contain only lower case letters and numbers with a minimum length of 4 characters")],
  async function (req, res) {

    // Error Validator
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }
    // Create lists for all the users in database
    var list = await UserDB.getAllUsers();
    var count = (list.length) + 1;
    // Create new User with all the parameters
    var newUserID = count.toString();
    var newFName = req.body.firstName;
    var newLName = req.body.lastName;
    var newEmail = req.body.emailAddress;
    var newUsername = req.body.username;
    var newPassword = req.body.password;
    
    // Logs New User
    console.log(newUserID);
    console.log(newFName);
    console.log(newLName);
    console.log(newEmail);
    console.log(newUsername);
    console.log(newPassword);

    // Email Address & Username Checker in database
    if (req.body.emailAddress == await UserDB.checkEmail(newEmail)) {
      console.log("User with entered username and email already exists.");
      res.render('signup', {
        error: "User with entered username and email already exists."
      });
    } else {
      // Create New User
      var newUser = new User({
        uid: newUserID,
        firstName: newFName,
        lastName: newLName,
        emailAddress: newEmail,
        username: newUsername,
        password: newPassword
      });
      // Add New User to Database
      await UserDB.addingNewUser(newUser);
      console.log("Successfully added new user!");
      // Render Login
      res.render('login', {
        error: "User has been created, please log in to test your credentials."
      });
    }
  });

// POST UPDATE CONNECTION
router.post('/updateEvent', [check('name').custom(value => /^[a-zA-Z0-9_: ]*$/.test(value)).isLength({ min: 4 }).withMessage("Name must be atleast 4 alphanumeric characters (can have spaces)."),
check('topic').custom(value => /^[a-zA-Z0-9_& ]*$/.test(value)).isLength({ min: 4 }).withMessage("Topic must have atleast 4 alphanumeric characters (can have spaces)."),
check('date').custom(value => /^[a-zA-Z0-9\-\/ ]*$/.test(value)).isLength({ min: 3 }).withMessage("Date must be atleast 6 alphanumeric or allowed special characters."),
check('time').custom(value => /^[a-zA-Z0-9_:,; ]*$/.test(value)).isLength({ min: 4 }).withMessage("Time must be atleast 4 alphanumeric or allowed special characters."),
check('location').custom(value => /^[a-zA-Z0-9_.;, ]*$/.test(value)).isLength({ min: 4 }).withMessage("Location must be atleast 4 alphanumeric or allowed special characters."),
check('details').custom(value => /^[a-zA-Z0-9_.,!?; ]*$/.test(value)).isLength({ min: 4 }).withMessage("Details must be atleast 4 alphanumeric or allowed special characters.")
], async function (req, res) {
  // Validation Error
  var errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // Update Connection Parameters
  var newCID = req.body.cid;
  var newCName = req.body.name;
  var newCTopic = req.body.topic;
  var newCDate = req.body.date;
  var newCTime = req.body.time;
  var newCLoc = req.body.location;
  var newCDets = req.body.details;
  var newCHost = req.body.hostid;
  // Update Connection
  var newConn = new Connection({ cid: newCID, name: newCName, topic: newCTopic, date: newCDate, time: newCTime, location: newCLoc, details: newCDets, hostid: newCHost });
  // Update Connection Method with new Connection information
  await connectionDB.updateConnection(newCID, newConn);
  // Update Connection with the user ID
  var userNum = req.session.theUser.uid;
  // Set user Profile and user hosted Items with the userConnection Created
  req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);
  req.session.hostedItems = await ConnectionDB.getCreatedConnections(userNum);
  // Render Saved Connections
  res.render('savedConnections', {
    data: req.session.userProfile, events: req.session.hostedItems, theUser: req.session.theUser
  });
});

// POST FOR PROFILE FUNCTIONS, SAVE, UPDATE PROFILE, UPDATE PROFILE RSVP, DELETE, SIGNOUT
router.post('/', [check('name').custom(value => /^[a-zA-Z0-9_: ]*$/.test(value)).isLength({ min: 4 }).withMessage("Name must be atleast 4 alphanumeric characters (can have spaces)."),
check('topic').custom(value => /^[a-zA-Z0-9_& ]*$/.test(value)).isLength({ min: 4 }).withMessage("Topic must have atleast 4 alphanumeric characters (can have spaces)."),
check('date').custom(value => /^[a-zA-Z0-9\-\/ ]*$/.test(value)).isLength({ min: 3 }).withMessage("Date must be atleast 6 alphanumeric or allowed special characters."),
check('time').custom(value => /^[a-zA-Z0-9_:,; ]*$/.test(value)).isLength({ min: 4 }).withMessage("Time must be atleast 4 alphanumeric or allowed special characters."),
check('location').custom(value => /^[a-zA-Z0-9_.;, ]*$/.test(value)).isLength({ min: 4 }).withMessage("Location must be atleast 4 alphanumeric or allowed special characters."),
check('details').custom(value => /^[a-zA-Z0-9_.,!?; ]*$/.test(value)).isLength({ min: 4 }).withMessage("Details must be atleast 4 alphanumeric or allowed special characters.")],
  async function (req, res) {

    console.log("-- ROUTER POST --");
    // Store Session theUser in userNum
    var userNum = req.session.theUser.uid;

    // STORE ACTION IN THE FORM
    var action = req.body.action;

    // CONNECTION ID
    var connID = req.body.connectionID;

    // USER PROFILE
    var userProfile = req.session.userProfile;

    // CONNECTIONS TO HOLD IN USER PROFILE
    var userConnections = [];
    for (i in userProfile) {
      userConnections.push(userProfile[i].connection);
    }

    // Store userConnections in the userItems session
    req.session.userItems = userConnections;

    // Store the userItems session into connectionList
    var connectionList = req.session.userItems;

    // ACTION: SAVE
    if (action == "save") {
      // Set value as the req.body.save & flag to check for true and false
      var value = req.body.save;
      var flag = false;
      // Connection list and the connection ID are true then break.
      for (i in connectionList) {
        if (connectionList[i].cid == connID) {
          flag = true;
          break;
        }
      }
      // FLAGS TO CHECK IF ADDING OR UPDATING
      if (flag == false) {
        console.log("Adding RSVP..");
        await UserConnectionDB.addRSVP(connID, userNum, value);
        req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);

      } else if (flag == true) {
        console.log("Updating RSVP..");
        await UserConnectionDB.updateRSVP(connID, userNum, value);
        req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);
      }
      res.render('savedConnections', {
        data: req.session.userProfile, events: req.session.hostedItems, theUser: req.session.theUser
      });

      // ACTION: UPDATE RSVP
    } else if (action == "Update RSVP") {
      // Check if connection is already in profile
      // DEFINE DATA AND USER TO HOLD CONNECTION AND THE USER
      var data = await ConnectionDB.getConnection(connID);
      var user = await UserDB.getUser(data[0].hostid);
      
      // If connection exists head back to the specific connection
      res.render('connection', {
        cID: data, theHost: user.firstName, theUser: req.session.theUser
      });

      // ACTION: DELETE
    } else if (action == "Delete") {
      await UserConnectionDB.removeConnection(connID, userNum);
      req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);

      // Go to Profile View to display the update
      res.render('savedConnections', {
        data: req.session.userProfile, events: req.session.hostedItems, theUser: req.session.theUser
      });

      // ACTION: Update Connection
    } else if (action == "Update Connection") {
      var data = await ConnectionDB.getConnection(connID);
      // Render updateConnection
      res.render('updateConnection', {
        theUser: req.session.theUser, info: data[0]
      });

      // ELSE IF action equals delete event, delete connection and all user RSVPS
    } else if (action == "Delete Connection") {
      // Wait the Connection to be deleted and also delete all savedRSVP assoicated with connection
      await ConnectionDB.deleteConnection(connID);
      await UserConnectionDB.deleteAllRSVPs(connID);
      // Request session userProfile and Hosted Items with the connections in profile and created connections
      req.session.userProfile = await UserConnectionDB.getUserProfile(userNum);
      req.session.hostedItems = await ConnectionDB.getCreatedConnections(userNum);
      // Render Saved Connections
      res.render('savedConnections', {
        data: req.session.userProfile, events: req.session.hostedItems, theUser: req.session.theUser
      });

      // ACTION: SIGN OUT
    } else if (action == "signout") {
      // Logs the Signout
      console.log("signout");
      // Destroys the session
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
          // Render the Index View
        } else {
          res.redirect('index');
        }
      });

      // ACTION: CREATE
    } else if (action == "Create") {

      // Catch if Nothing is Entered
      var errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }

      // Add Connection to the List
      var list = await ConnectionDB.getConnections();
      var count = (list.length) + 1;

      // Define New Connection from Form
      var newCID = count.toString();
      var newCName = req.body.name;
      var newCTopic = req.body.topic;
      var newCDate = req.body.date;
      var newCTime = req.body.time;
      var newCLoc = req.body.location;
      var newCDets = req.body.details;
      var newCHost = req.body.hostid;

      // Set New Connection
      var newConn = new Connection({
        cid: newCID,
        name: newCName,
        topic: newCTopic,
        date: newCDate,
        time: newCTime,
        location: newCLoc,
        details: newCDets,
        hostid: newCHost
      });
      
      // Save New Connection
      await newConn.save();
      // Set Data and Topics to get connections and topics from database
      var data = await ConnectionDB.getConnections();
      var topics = await ConnectionDB.getConnectionTopics();
      // Set hostedItems to wait for Created Connections from the UserNum
      req.session.hostedItems = await ConnectionDB.getCreatedConnections(userNum);
      // Render the Connections Page
      res.render('connections', {
        cID: data, topics: topics, events: req.session.hostedItems, theUser: req.session.theUser
      })
    } else {
      // Render the saved Connections with created connections of user
      req.session.hostedItems = await ConnectionDB.getCreatedConnections(userNum);
      res.render('savedConnections', {
        data: req.session.userProfile, events: req.session.hostedItems, theUser: req.session.theUser
      });
    }
  });

// Router Checker
router.get('/*', function (req, res) {
  res.send('No Information Available');
});

module.exports = router;
