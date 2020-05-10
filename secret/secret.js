module.exports = {
    auth: {
        user: 'naymulislam007@gmail.com',
        pass: 'FARJANA26452@'
    },
    
    facebook: {
        clientID: '259197125354947',
        clientSecret: '6580a52f53bd7b85a9155d25cce34987',
        profileFields: ['email', 'displayName'],
        callbackURL : 'http://localhost:3000/auth/facebook/callback',
        passReqToCallback: true
    }
}