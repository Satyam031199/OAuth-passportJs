const passport = require('passport');
const User = require('../models/user-model');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
      done(null, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.clientId,
    clientSecret: process.env.clientSecret,
    callbackURL: '/auth/google/redirect'
  },
  function(accessToken, refreshToken, profile, done) {
    // Here, you would usually find or create a user in your database
    // For simplicity, we'll just return the Google profile
    User.findOne({googleId: profile.id}).then((currentUser) => {
      if(currentUser){
          // already have this user
          console.log('user is: ', currentUser);
          done(null, currentUser);
      } else {
          // if not, create user in our db
          new User({
              googleId: profile.id,
              username: profile.displayName,
              thumbnail: profile._json.picture
          }).save().then((newUser) => {
              console.log('created new user: ', newUser);
              done(null, newUser);
          });
      }
  });
  }
));

