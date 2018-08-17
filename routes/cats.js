// External Dependencies
const express = require("express");
const csrf = require("csurf");

// Setup Router
const router = express.Router();

// Get Models
const Cat = require("../models/Cat");
const User = require("../models/User");

// Get Middlewares
const { needLogin, loggedIn } = require("../middlewares/middlewares");

// Custom Middleware
router.all("/*", (req, res, next) => {
  res.locals.layout = "layouts/dashboard";
  next();
});

const csrfProtection = csrf({ cookie: true });

// Route Get: /admin/categories
router.get("/", needLogin, csrfProtection, (req, res) => {
  User.findById(req.user._id)
    .populate("cats")
    .exec((err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        res.render("pages/admin/cats", {
          csrfToken: req.csrfToken(),
          cats: foundUser.cats.reverse()
        });
      }
    });
});

// Route Post: /admin/categories/add
router.post("/add", needLogin, csrfProtection, (req, res) => {
  if (!req.body.cat) {
    req.flash("error", "The category field is required");
    res.redirect("/admin/categories");
  } else if (req.body.cat.length < 3 || req.body.cat.length > 15) {
    req.flash("error", "The category name must be 3 to 15 char long");
    res.redirect("/admin/categories");
  } else {
    Cat.create({ name: req.body.cat }, (err, createdCat) => {
      if (err) {
        console.log(err);
      } else {
        User.findById(req.user._id)
          .populate("cats")
          .exec((err, userRelatedCats) => {
            if (err) {
              console.log(err);
            } else {
              userRelatedCats.cats.push(createdCat);
              userRelatedCats.save();
              req.flash("success", "Your category has been created");
              res.redirect("/admin/categories");
            }
          });
      }
    });
  }
});

// Route Get: /admin/categories/edit/:id
router.get("/edit/:id", needLogin, csrfProtection, (req, res) => {
  Cat.findById(req.params.id).exec((err, foundCat) => {
    if (err) {
      console.log(err);
    } else {
      res.render("pages/admin/cats/edit", {
        csrfToken: req.csrfToken(),
        cat: foundCat
      });
    }
  });
});

// Route Post: /admin/categories/edit/:id
router.post("/edit/:id", needLogin, csrfProtection, (req, res) => {
  if (!req.body.cat) {
    req.flash("error", "The category field is required");
    res.redirect("/admin/categories/edit/" + req.params.id);
  } else if (req.body.cat.length < 3 || req.body.cat.length > 15) {
    req.flash("error", "The category name must be 3 to 15 char long");
    res.redirect("/admin/categories/edit/" + req.params.id);
  } else {
    Cat.findByIdAndUpdate(
      req.params.id,
      { name: req.body.cat },
      (err, updatedCat) => {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Your category has been updated");
          res.redirect("/admin/categories");
        }
      }
    );
  }
});

// Route Get: /admin/categories/delete/:id
router.get("/delete/:id", needLogin, csrfProtection, (req, res) => {
  Cat.findByIdAndRemove(req.params.id, err => {
    if (err) {
      console.log(err);
    } else {
      req.flash("success", "Your category has been deleted");
      res.redirect("/admin/categories");
    }
  });
});

// Export Router
module.exports = router;
