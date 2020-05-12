var mongoose = require('mongoose');

//company model
var companySchema = mongoose.Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    city: {type: String, required: true},
    country: {type: String, required: true},
    sector: {type: String, required: true},
    website: {type: String, required: true},
    image: {type: String, default: 'defaultPic.png'},
    
    employees:[{
        employeeId: {type: String, default: ''},
        employeeFullname: {type: String, default: ''},
        employeeRole: {type: String, default: ''}
    }],
    
    companyRating: [{
        companyName: {type: String, default: ''},
        userFullname: {type: String, default: ''},
        userRole: {type: String, default: ''},
        companyImage: {type: String, default: ''},
        userRating: {type: Number, default: 0},
        userRole: {type: String, default: ''}
    }],
    
    ratingNumber: [Number],
    ratingSum: {type: Number, default: 0} 
});
 
module.exports = mongoose.model('Company', companySchema );