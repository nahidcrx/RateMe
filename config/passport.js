var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../secret/secret');

var User = require('../models/user');


passport.serializeUser((user, done) => {
    done(null, user.id);
});


passport.deserializeUser((id, done) => {
    User.findById(id,(err, user) => {
        done(err, user);
    });
});


//signup and store in db
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({'email':email}, (err, user) =>{
        if(err){
            return done(err);
        }
        
        if(user){
            return done(null, false, req.flash('error','Email Already Exist'));
        }
        
//        if(req.files){
//            
//            var file = req.files.pro_pic;
//            
//            file.mv('./public/users/' + file.name);
//
//            //console.log(req.files.pro_pic.name);
//            console.log("Success");
//        }
        
        var newUser = new User();
        newUser.fullname = req.body.fullname;
        newUser.email = req.body.email;
        newUser.password = newUser.encryptPassword(req.body.password);
        
        //If pro_pic
        //console.log(req.files.pro_pic.name);
        
        newUser.save((err) => {
            return done(null, newUser);
        });
    })
}));

//passport.use('local.signupprofilepic', new LocalStrategy({
//    usernameField: 'email',
//    passwordField: 'password',
//    passReqToCallback: true
//}, (req, email, password, done) => {
//    User.findOne({'email':email}, (err, user) =>{
//        if(err){
//            return done(err);
//        }
//        
//        if(user){
//            return done(null, false, req.flash('error','Email Already Exist'));
//        }
//        
////        if(req.files){
////            
////            var file = req.files.pro_pic;
////            
////            file.mv('./public/users/' + file.name);
////
////            //console.log(req.files.pro_pic.name);
////            console.log("Success");
////        }
//        
//        var newUser = new User();
//        newUser.fullname = req.body.fullname;
//        newUser.email = req.body.email;
//        newUser.password = newUser.encryptPassword(req.body.password);
//        
//        //If pro_pic
//        //console.log(req.files.pro_pic.name);
//        
//        newUser.save((err) => {
//            return done(null, newUser);
//        });
//    })
//}));

//login
 passport.use('local.login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({'email':email}, (err, user) =>{
        if(err){
            return done(err);
        }
        var messages = [];
        if(!user || !user.validPassword(password)){
            messages.push('Email Does Not Exist || Password is Invalid')
            return done(null, false,req.flash('error',messages));
        }
        
        return done(null, user);
        
    })
}));

//facebook login

passport.use(new FacebookStrategy({
        clientID: '259197125354947',
        clientSecret: '6580a52f53bd7b85a9155d25cce34987',
        profileFields: ['email', 'displayName'],
        callbackURL : 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    },(req, token, refreshToken, profile, done) => {
    User.findOne({facebook: profile.id}, (err, user) => {
        if(err){
            return done(err);
        }
        
        if(user){
            return done(null, user);
        }else{
            var newUser = new User();
            newUser.facebook = profile.id;
            newUser.fullname = profile.displayName;
            newUser.email = profile._json.email;
            newUser.tokens.push({token: token});
            
            newUser.save((err) => {
               return done(null, newUser); 
            })
        }
    })
}))