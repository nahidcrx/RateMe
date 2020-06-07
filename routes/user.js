var nodemailer = require('nodemailer');
var async = require('async');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var crypto = require('crypto');
var User = require('../models/user');
var secret = require('../secret/secret');

//user route declaration
module.exports = (app, passport) => {
    app.get('/', function(req,res,next){
        
        if(req.session.cookie.originalMaxAge != null){
            res.redirect('/home');
        }
        else{
           res.render('index', {title: 'Index || RateMe'}); 
        }
    });
    
    app.get('/signup', function(req,res){
        var errors = req.flash('error');
        res.render('user/signup' , {title: 'Sign Up || RateMe', messages: errors, hasErrors: errors.length>0});
    });
    
    app.post('/signup', validateRegisterForm, passport.authenticate('local.signup', {
        successRedirect: '/profilepic',
        failureRedirect: '/signup',
        failureFlash: true
    }));
    
    app.get('/profilepic', function(req,res){
        var errors = req.flash('error');
        res.render('user/profilepic' , {title: 'Profile Pic Upload || RateMe', messages: errors, hasErrors: errors.length>0});
    });
    
     app.post('/profilepic/check', (req, res) => {
         
        User.findOne({'email':req.user.email}, (err, user, done) =>{
            if(err){
                return done(err);
            }
            if(user){
                user.image = req.body.upload;
                user.save();
            }
        })
         
         res.redirect('/home');
         
    });
    
    //For formidable file-upload
    app.post('/profilepic/upload', (req, res) => {
        var form = new formidable.IncomingForm();
        
        
        form.encoding = 'utf-8';
        form.keepExtensions = true;
        //form.maxFileSixe = 3 * 1024 *1024;

        
        
        ////Done
        //// File Validation Needed
        
        form.uploadDir = path.join(__dirname, '../public/users');
        
        form.on('file', (field, file) => {
            //console.log(file);
            
           fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
               if(err){
                   throw err;
               }
               console.log('File has been renamed');
           }); 
        });
        
        form.on('error', (err) => {
            console.log('An error occured', err);
        });
        
        form.on('end', () => {
            //console.log('File upload was successful');
        });
        
        form.parse(req);
    });
     
    app.get('/login', function(req,res){
        var errors = req.flash('error');
        res.render('user/login' , {title: 'Login || RateMe', messages: errors, hasErrors: errors.length>0});
    });
    
    app.post('/login', validateLoginForm, passport.authenticate('local.login', {
        //successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => {
        if(req.body.rememberme){
            req.session.cookie.maxAge = 30*24*60*60*1000; //30 Days
        }else{
            req.session.cookie.expires = null;
        }
        res.redirect('/home');
    });
    
    app.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/home',
        failureRedirect: '/login',
        failureFlash: true
    }));
    
    app.get('/home', function(req,res){
        res.render('home' , {title: 'Home || RateMe', user:req.user});
    });
    
    app.get('/forgot', function(req,res){
        var errors = req.flash('error');
        var info = req.flash('info');
        res.render('user/forgot',{title: 'Request Pasword Reset', messages: errors,hasErrors: errors.length>0, info: info,noErrors: info.length>0});
    });
    
    app.post('/forgot', (req, res, next) => {
        async.waterfall([
            function(callback){
                crypto.randomBytes(20, (err, buf) =>{
                    var rand = buf.toString('hex');
                    callback(err, rand);
                });
            },
            
            function(rand, callback){
                
                    req.checkBody('email', 'Email is Required').notEmpty();
                    req.checkBody('email', 'Email is Invalid').isEmail();
                    
                    var errors = req.validationErrors();
                    
                    if(errors){
                        var messages = [];
                        errors.forEach((error) => {
                            messages.push(error.msg)
                            //console.log('Error Pushed');
                        })
                        
                        req.flash('error', messages);
                        res.redirect('/forgot');
                    }else{
                        
                        User.findOne({'email':req.body.email}, (err, user) => {
                        if(!user){
                            req.flash('error', 'No Account With That Exist Or Email Is Invalid ');
                            return res.redirect('/forgot');
                        }

                        user.passwordResetToken = rand;
                        user.passwordResetExpires = Date.now() + 60*60*1000;

                        user.save((err) =>{
                            callback(err, rand, user)
                        });
                        })
                    }
            },
            
            function(rand, user, callback){
                    var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user:'marjiacrx@gmail.com',
                        pass:'NAHID123@'
                    }
                });
                
                var mailOptions = {
                    to: user.email,
                    from: 'RateMe '+'<marjiacrx@gmail.com>',
                    subject: 'RateMe Application Password Reset Token',
                    text: 'You have requested for pasword reset token. \n\n'+
                    'please click on the link to complete process: \n\n'+
                    'http://localhost:3000/reset/'+rand+'\n\n'
                };
                
                transporter.sendMail(mailOptions, (error, info) => {
                        req.flash('info','A password reset token has been sent to '+ user.email);
                        return callback(error,user);
                    
                });
            }
            
        ], (err) => {
          if(err){
              return next(err);
          }
            res.redirect('/forgot');
        })
    });
    
    
    app.get('/reset/:token',(req,res) => {
        
        User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
            if(!user){
                req.flash('error', 'Password reset token has expired or invalid. Enter your email to get a new token');
                return res.redirect('/forgot');
            }
        var errors = req.flash('error');
        var success = req.flash('success');
        res.render('user/reset',{title: 'Pasword Reset', messages: errors,hasErrors: errors.length>0, success: success,noErrors: success.length>0});
            
        });
    });
    
    app.post('/reset/:token', (req,res) => {
        async.waterfall([
            function(callback){
                User.findOne({passwordResetToken:req.params.token, passwordResetExpires: {$gt: Date.now()}}, (err, user) => {
                    if(!user){
                        req.flash('error', 'Password reset token has expired or is invalid. Enter your email to get a new token.');
                        return res.redirect('/forgot');
                    }
                    
                    req.checkBody('password', 'Password is Required').notEmpty()
                    req.checkBody('password', 'Password Must Not Be Less Than 8').isLength({min:8});
                    req.check("password", "Password Must Contain at Least One Upper Case , One Lower Case , One Digit, One Special Charachter.").matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "i");
                    
                    var errors = req.validationErrors();
                    
                    if(req.body.password == req.body.cpassword){
                        if(errors){
                            var messages = [];
                            errors.forEach((error) => {
                                messages.push(error.msg)
                            })
                            
                            req.flash('error', messages);
                            res.redirect('/reset/'+req.params.token);
                        }else{
                            user.password = user.encryptPassword(req.body.password);
                            user.passwordResetToken = undefined;
                            user.passwordResetExpires = undefined;
                            
                            user.save((err) => {
                                req.flash('success', 'Your password has been successfully updated.');
                                callback(err, user);
                            })
                        }
                    }else{
                        req.flash('error', 'Password and confirm password are not equal.');
                        res.redirect('/reset/'+req.params.token);
                    }
                    
//                    
                });
            },
            
            function(user, callback){
                var transporter = nodemailer.createTransport({
                    service: 'Gmail',
                    auth: {
                        user:'marjiacrx@gmail.com',
                        pass:'NAHID123@'
                    }
                });
                
                var mailOptions = {
                    to: user.email,
                    from: 'RateMe '+'<marjiacrx@gmail.com>',
                    subject: 'Your password has been updated.',
                    text: 'This is a confirmation that you updated the password for '+user.email
                };
                
                transporter.sendMail(mailOptions, (error, info) => {
                    
                    
                    var errors = req.flash('error');
                    var success = req.flash('success');
                    res.render('user/reset',{title: 'Reset Your Password', messages: errors,hasErrors: errors.length>0, success: success,noErrors: success.length>0});
                    
                    return callback(error,user);
                });
            }
        ]);
    });
    
    app.get('/logout', function(req,res){
        req.logout();
        
        req.session.destroy((err) => {
            res.redirect('/');
        })
    });
}

//validator function
function validateRegisterForm(req,res,next){
    req.checkBody('fullname', 'Fullname is Required').notEmpty();
    req.checkBody('fullname', 'Fullname Must Not Be Less Than 5').isLength({min:5});
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty()
    req.checkBody('password', 'Password Must Not Be Less Than 8').isLength({min:8});
    req.check("password", "Password Must Contain at Least One Upper Case , One Lower Case , One Digit, One Special Charachter.").matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "i");
    
    
    var errors = req.validationErrors();
    
    if(errors){
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        
        req.flash('error', messages);
        res.redirect('/signup');
    }
    else{
        return next();
    }
}

function validateLoginForm(req,res,next){
    req.checkBody('email', 'Email is Required').notEmpty();
    req.checkBody('email', 'Email is Invalid').isEmail();
    req.checkBody('password', 'Password is Required').notEmpty()
    req.checkBody('password', 'Password Must Not Be Less Than 8').isLength({min:8});
    req.check("password", "Password Must Contain at Least One Upper Case , One Lower Case , One Digit, One Special Charachter.").matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "i");
    
    
    var errors = req.validationErrors();
    
    if(errors){
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        
        req.flash('error', messages);
        res.redirect('/login');
    }
    else{
        return next();
    }
}