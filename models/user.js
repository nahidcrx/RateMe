var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//user model
var userSchema = mongoose.Schema({
    fullname: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String},
    image: {type: String, default: 'defaultPic.png'},
    role: {type: String, default: ''},
    company: {
        name: {type: String, default: ''},
        image: {type: String, default: ''}
    },
    passwordResetToken: {type: String, default: ''},
    passwordResetExpires: {type: Date, default: Date.now},
    facebook:{type:String,default: ''},
    tokens: Array
});

//encrypt password
userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, salt);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);