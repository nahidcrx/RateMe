//require all moduels
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var fileUpload = require('express-fileupload'); //Don't use while use formidable for file upload
var validator = require('express-validator');
var ejs = require('ejs');
var engine = require('ejs-mate');
var session = require('express-session');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var _ = require('underscore');
var moment = require('moment');

var app = express();

//database connection
mongoose.connect('mongodb://localhost/rateme', { useNewUrlParser: true , useUnifiedTopology: true });

require('./config/passport');
require('./secret/secret.js');

//middleware
app.use(express.static('public'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
//always add express-validator middleware after bodyparser
app.use(validator());
//app.use(fileUpload()); //Don't use while use formidable for file upload

//express session middleware
app.use(session({
    secret: 'Thisismytestkey',
    resave : false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
//always add passport middleware after session middleware
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.locals._ = _;
app.locals.moment = moment;

//route
require('./routes/user')(app, passport);
require('./routes/company')(app, passport);
require('./routes/review')(app);
require('./routes/message')(app);

//port
app.listen(3000, function(){
    console.log('App running on port 3000');
})