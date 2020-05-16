var formidable = require('formidable');
var path = require('path');
var fs = require('fs');

var Company = require('../models/company');

module.exports = (app) => {
    app.get('/company/create', (req, res) => {
        var success = req.flash('success');
        res.render('company/company', {title: 'Company Registration', user: req.user, success:success, noErrors: success.length > 0});
    });
    
app.post('/company/create', (req, res) => {
    
    
    // for express-fileupload start
    if(req.files){
            
            var file = req.files.company_pic;
            
            file.mv('./public/companies/' + file.name);

            //console.log(req.files.company_pic.name);
            //console.log("Success");
        }
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
            
            console.log(newCompany);
            
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
}