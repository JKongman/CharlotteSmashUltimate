var express = require('express');
var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');

// CONTROLLERS
var connectionController = require('./routes/connectionController');
var profileController = require('./routes/profileController');

// EXPRESS
var app = express();

// MONGOOSE
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/smashDB', {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connection successful!");
});

// CSS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));

// BODY PARSER
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// COOKIE PARSER
app.use(session({secret: "secret", resave: true, saveUninitialized: true}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// APP USE
app.use('/profile', profileController);
app.use('/', connectionController);

app.listen(8080);
