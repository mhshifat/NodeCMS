// External Dependencies
const express = require("express");
const bcrypt = require("bcryptjs");
const csrf = require("csurf");
const passport = require("passport");

// Setup Router
const router = express.Router();

// Get Middlewares
const { needLogin, loggedIn } = require("../middlewares/middlewares");

// Get Models
const User = require("../models/User");

const csrfTokenProtection = csrf({ cookie: true });

// Route Get: /users/login
router.get("/login", loggedIn, csrfTokenProtection, (req, res) => {
  res.render("pages/users/login", { csrfToken: req.csrfToken() });
});

// Route Post: /users/login
router.post("/login", loggedIn, (req, res, next) => {
  const { _csrf, email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Please fill out all the empty fields");
    res.redirect("/users/login");
  } else {
    const isEmail = email.includes("@") && email.endsWith(".com");
    if (!isEmail) {
      req.flash("error", "Please use a valid email address");
      res.redirect("/users/login");
    } else {
      passport.authenticate("local", {
        successRedirect: "/admin/dashboard",
        failureRedirect: "/users/login",
        failureFlash: true
      })(req, res, next);
    }
  }
});

// Route Get: /users/register
router.get("/register", loggedIn, csrfTokenProtection, (req, res) => {
  res.render("pages/users/register", { csrfToken: req.csrfToken() });
});

// Route Post: /users/register
router.post("/register", loggedIn, (req, res) => {
  const { _csrf, username, email, password } = req.body;
  if (!username || !email || !password) {
    req.flash("error", "Please fill out all the empty fields");
    res.redirect("/users/register");
  } else {
    const isEmail = email.includes("@") && email.endsWith(".com");
    if (!isEmail) {
      req.flash("error", "Please use a valid email address");
      res.redirect("/users/register");
    } else {
      if (
        username.length < 8 ||
        username.length > 15 ||
        password.length < 8 ||
        password.length > 15
      ) {
        req.flash("error", "Username and password must be 8 to 15 char long");
        res.redirect("/users/register");
      } else {
        User.findOne({ email }, (err, foundUser) => {
          if (err) {
            console.log(err);
          } else {
            if (foundUser) {
              req.flash("error", "A user of this email already exist");
              res.redirect("/users/register");
            } else {
              bcrypt.hash(password, 10, (err, hashedPwd) => {
                if (err) {
                  console.log(err);
                } else {
                  const newUser = {
                    username,
                    email,
                    password: hashedPwd
                  };
                  User.create(newUser, (err, createdUser) => {
                    if (err) {
                      console.log(err);
                    } else {
                      req.flash("success", "Your account has been created");
                      res.redirect("/users/login");
                    }
                  });
                }
              });
            }
          }
        });
      }
    }
  }
});

router.get("/logout", needLogin, (req, res) => {
  req.logout();
  req.flash("success", "You have been logged out");
  res.redirect("/users/login");
});

// Export Router
module.exports = router;
