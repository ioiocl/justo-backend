var express    = require('express');      
var app        = express();                 
var bodyParser = require('body-parser');
var fs = require('fs'); 
var jwt = require('jsonwebtoken'); 
var http = require('http');
var https = require('https');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var session = require('express-session');
var jwt        = require("jsonwebtoken");

var MongoClient = require('mongodb').MongoClient;


var setup = require('./setup'); 
var util = require('./util')(app, jwt, MongoClient, setup)


var URLSERVER = setup.url_server;
var datadir = setup.datadir;
var secret = setup.secret;
var urlDB = setup.database;

//Https credentials
var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.cert', 'utf8');
var credentials = {key: privateKey, cert: certificate};

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.setHeader('Access-Control-Max-Age', '1000');
  next();
});
app.use(bodyParser({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

  app.use(session({
    secret: setup.secret,
    saveUninitialized: false,
    resave: false
})); 

app.use(passport.initialize());
app.use(passport.session());

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(8443);

console.log('Justo Ahora is up');

//Passport setup
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new FacebookStrategy({
    clientID: "832861053471099",
    clientSecret: "91d269205409383d34d53429b441eaa7",
    callbackURL: "http://justoahora.org/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      return done(null, profile);
    });
  }
));

passport.use(new TwitterStrategy({
    consumerKey: "pO591S3sBKNYvXmM2rSmNA",
    consumerSecret: "5QtAZMVL24KMG0yR3X03Faex1Mp5LhWQwguWDEXMqVY",
    callbackURL: "http://justoahora.org/auth/twitter/callback"
  },       
  function(token, tokenSecret, profile, cb) {
    console.log("ID :"+ profile.id)
	return cb(null, profile);
  } 
));

//REST API
require('./rest.js')(app, jwt, MongoClient, util, setup, passport);



 
 