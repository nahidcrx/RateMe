var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var async = require('async');

var Company = require('../models/company');
var User = require('../models/user');

module.exports = (app) => {
    
    
    app.get('/company/create', (req, res) => {
        var success = req.flash('success');
        var errors = req.flash('error');
        
        res.render('company/company', {title: 'Company Registration', user: req.user, success:success, noErrors: success.length > 0, messages: errors, hasErrors: errors.length>0});
    });
    
app.post('/company/create',validateCompanyRegister, (req, res) => {
    
    
    // for express-fileupload start
//    if(req.files){
//            
//            var file = req.files.company_pic;
//            
//            file.mv('./public/companies/' + file.name);
//
//            //console.log(req.files.company_pic.name);
//            //console.log("Success");
//        }
    // for express-fileupload end
    
    
        var newCompany = new Company();
        newCompany.name = req.body.name;
        newCompany.address = req.body.address;
        newCompany.city = req.body.city;
        newCompany.country = req.body.country;
        newCompany.sector = req.body.sector;
        newCompany.website = req.body.website;
        newCompany.image = req.body.upload;// for formidable fileupload
    
        //newCompany.image = req.files.company_pic.name;// for express-fileupload
        newCompany.save((err) => {
            if(err){
                console.log(err);
            }
            
            //console.log(newCompany);
            
            req.flash('success', 'Company data has been added.');
            res.redirect('/company/create');
        })
    });
   
    // for formidable fileupload
    app.post('/upload', (req, res) => {
        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';
        
        form.uploadDir = path.join(__dirname, '../public/companies');
        
        form.on('file', (field, file) => {
           fs.rename(file.path, path.join(form.uploadDir, file.name), (err) => {
               if(err){
                   throw err;
               }
               
               //console.log('File has been renamed');
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
    
    app.get('/companies', (req, res) => {
        Company.find({}, (err, result) => {
           
            res.render('company/companies', {title: 'All Companies || Rateme', user: req.user, data:result });
        })
    });
    
    app.get('/company-profile/:id', (req, res) => {
        Company.findOne({'_id':req.params.id}, (err, data) => {
            //var avg = arrayAverage(data.ratingNumber);
            
            res.render('company/company-profile', {title: 'Company Name', user:req.user, id: req.params.id, data:data});
        });
    });
    
//    app.get('/company/register-employee/:id', (req, res) => {
//        res.render('company/register-employee', {title: 'Register Employee', user:req.user, id: req.params.id});
//    });
    
    
    app.get('/company/register-employee/:id', (req, res) => {
        
        Company.findOne({'_id':req.params.id}, (err, data) => {
            //var avg = arrayAverage(data.ratingNumber);
            
            res.render('company/register-employee', {title: 'Company Name', user:req.user, id: req.params.id, data:data});
        });
    });
    
    app.post('/company/register-employee/:id', (req,res,next) => {
        async.parallel([
            function(callback){
               Company.update({
                    '_id': req.params.id,
                    'employee.employeeId': {$ne: req.user._id}
               },
                {
                    $push: {employees: {employeeId: req.user._id, employeeFullname: req.user.fullname, employeeRole:req.body.role}}  
               },
                    (err, count) => {
                        if(err){
                            return next(err);
                        }
                        callback(err, count);
               }); 
            },
            
            function(callback){
                async.waterfall([
                    function(callback){
                        Company.findOne({'_id': req.params.id}, (err,data) => {
                            callback(err,data);
                        });
                    },
                    function(data, callback){
                        
                        User.findOne({'_id': req.user._id}, (err, result) => {
                            result.role = req.body.role;
                            result.company.companyId = data._id;
                            result.company.name = data.name;
                            result.company.image = data.image;
                            
                            result.save((err) => {
                                res.redirect('/home');
                            });
                        })
                    }
                ])
            }
        ])
    });

}



//validator function
function validateCompanyRegister(req,res,next){
    req.checkBody('name', 'Company name is required').notEmpty();
    req.checkBody('name', 'Company name must not be less than 5').isLength({min:5});
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();
    req.checkBody('country', 'Country is required').notEmpty();
    req.checkBody('sector', 'Sector is required').notEmpty();
    req.checkBody('website', 'Website is required').notEmpty();
    //req.checkBody('upload', 'Company image is required').notEmpty();
    
    
    
    var errors = req.validationErrors();
    
    if(errors){
        var messages = [];
        errors.forEach((error) => {
            messages.push(error.msg)
        });
        
        req.flash('error', messages);
        res.redirect('/company/create');
    }
    else{
        return next();
    }
}