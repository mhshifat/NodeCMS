// External Dependencies
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

// Get Models
const User = require("../models/User");

module.exports = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email }).exec((err, user) => {
        if (err) return console.log(err);
        if (!user) {
          return done(null, false, {
            message: "A User of this email doesn't exist"
          });
        } else {
          bcrypt.compare(password, user.password, (err, pwdMatched) => {
            if (err) return console.log(err);
            if (!pwdMatched) {
              return done(null, false, {
                message: "Password doesn't match"
              });
            } else {
              return done(null, user);
            }
          });
        }
      });
    })
  );
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
