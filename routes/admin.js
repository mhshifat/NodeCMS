// External Dependencies
const path = require("path");
const fs = require("fs");
const express = require("express");
const csrf = require("csurf");

// Setup Router
const router = express.Router();

// Get Models
const Post = require("../models/Post");
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

// Route Get: /admin/dashboard
router.get("/dashboard", needLogin, (req, res) => {
  res.render("pages/admin");
});

// Route Get: /admin/posts
router.get("/posts", needLogin, (req, res) => {
  User.findById(req.user._id)
    .populate("posts")
    .sort({ date: -1 })
    .exec((err, foundUser) => {
      if (err) {
        console.log(err);
      } else {
        res.render("pages/admin/posts", { posts: foundUser.posts.reverse() });
      }
    });
});

// Route Get: /admin/posts/add
router.get("/posts/add", needLogin, csrfProtection, (req, res) => {
  Cat.find({}, (err, allCats) => {
    if (err) {
      console.log(err);
    } else {
      res.render("pages/admin/posts/create", {
        csrfToken: req.csrfToken(),
        cats: allCats
      });
    }
  });
});

// Route Post: /admin/posts/add
router.post("/posts/add", needLogin, (req, res) => {
  const { _csrf, title, status, cat, allowComment, body } = req.body;
  if (!title || !body || !req.files.image) {
    req.flash("error", "Please fill out the empty fields");
    res.redirect("/admin/posts/add");
  } else {
    if (
      req.files.image.mimetype === "image/png" ||
      req.files.image.mimetype === "image/jpg" ||
      req.files.image.mimetype === "image/jpeg"
    ) {
      const slug = title.replace(" ", "-").toLowerCase();
      Post.findOne({ slug }, (err, foundPost) => {
        if (err) {
          console.log(err);
        } else {
          if (foundPost) {
            req.flash("error", "Please use another title for your post");
            res.redirect("/admin/posts/add");
          } else {
            const image = req.files.image;
            const imageName = Date.now() + "-" + image.name;
            const newPost = {
              title,
              slug,
              status,
              cat: cat || "Uncategorised",
              image: imageName,
              allowComment: allowComment === "on" ? true : false,
              body
            };
            Post.create(newPost, (err, createdPost) => {
              if (err) {
                console.log(err);
              } else {
                image.mv(
                  path.join(
                    __dirname,
                    `../public/images/post-images/${imageName}`
                  ),
                  err => {
                    if (err) {
                      console.log(err);
                    } else {
                      User.findById(req.user._id)
                        .populate("posts")
                        .exec((err, userRelatedPost) => {
                          if (err) {
                            console.log(err);
                          } else {
                            userRelatedPost.posts.push(createdPost);
                            userRelatedPost.save();
                            req.flash("success", "Your post has been created");
                            res.redirect("/admin/posts");
                          }
                        });
                    }
                  }
                );
              }
            });
          }
        }
      });
    } else {
      req.flash("error", "Please use a valid image file");
      res.redirect("/admin/posts/add");
    }
  }
});

// Route Get: /admin/posts/edit/:slug
router.get("/posts/edit/:slug", needLogin, csrfProtection, (req, res) => {
  Post.findOne({ slug: req.params.slug }).exec((err, foundPost) => {
    if (err) {
      console.log(err);
    } else {
      const status = ["Public", "Private", "Draft"];
      const firstChar = String(foundPost.status)
        .charAt(0)
        .toUpperCase();
      let statusName = foundPost.status.split("").splice(1);
      statusName = statusName.join("");
      const gotTheCurrentStatus = `${firstChar}${statusName}`;
      const index = status.indexOf(gotTheCurrentStatus);
      status.splice(index, 1);
      status.unshift(gotTheCurrentStatus);

      Cat.find({}, (err, allCats) => {
        if (err) {
          console.log(err);
        } else {
          const catsArray = [];
          allCats.forEach(cat => {
            catsArray.push(cat.name);
          });
          const indexOfCat = catsArray.indexOf(foundPost.cat);
          catsArray.splice(indexOfCat, 1);
          catsArray.unshift(foundPost.cat);
          res.render("pages/admin/posts/edit", {
            csrfToken: req.csrfToken(),
            post: foundPost,
            status,
            cats: catsArray
          });
        }
      });
    }
  });
});

// Route Post: /admin/posts/edit/:id
router.post("/posts/edit/:id", needLogin, csrfProtection, (req, res) => {
  const { _csrf, title, status, cat, allowComment, body } = req.body;
  const slug = title.replace(" ", "-").toLowerCase();
  Post.findById(req.params.id, (err, foundImage) => {
    if (err) {
      console.log(err);
    } else {
      const image = req.files.image;
      const imageName = req.files.image
        ? Date.now() + "-" + image.name
        : foundImage.image;
      const updatePost = {
        title,
        slug,
        status,
        cat,
        image: imageName,
        allowComment: allowComment === "on" ? true : false,
        body
      };
      Post.findByIdAndUpdate(req.params.id, updatePost, (err, updatedPost) => {
        if (err) {
          console.log(err);
        } else {
          if (updatedPost) {
            if (req.files.image) {
              image.mv(
                path.join(
                  __dirname,
                  `../public/images/post-images/${imageName}`
                ),
                err => {
                  if (err) {
                    console.log(err);
                  } else {
                    fs.unlink(
                      path.join(
                        __dirname,
                        `../public/images/post-images/${foundImage.image}`
                      ),
                      err => {
                        if (err) {
                          console.log(err);
                        }
                      }
                    );
                  }
                }
              );
            }
            req.flash("success", "Your post has been updated");
            res.redirect("/admin/posts");
          }
        }
      });
    }
  });
});

// Route Get: /admin/posts/delete/:id
router.get("/posts/delete/:id", needLogin, csrfProtection, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    if (err) {
      console.log(err);
    } else {
      Post.findByIdAndRemove(req.params.id, err => {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(
            path.join(
              __dirname,
              `../public/images/post-images/${foundPost.image}`
            ),
            err => {
              if (err) {
                console.log(err);
              } else {
                req.flash("success", "Your post has been deleted");
                res.redirect("/admin/posts");
              }
            }
          );
        }
      });
    }
  });
});

// Export Router
module.exports = router;
