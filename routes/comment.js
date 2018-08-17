// External Dependencies
const express = require("express");

// Setup Router
const router = express.Router();

// Get Models
const Post = require("../models/Post");
const Cat = require("../models/Cat");
const Comment = require("../models/Comment");

// Get Middlewares
const { needLogin, loggedIn } = require("../middlewares/middlewares");

// Route Get: /comment
router.post("/comment/:slug", needLogin, (req, res) => {
  if (!req.body.comment) {
    req.flash("error", "The comment field can not be empty");
    res.redirect("/posts/" + req.params.slug);
  } else {
    const newMessage = {
      user: req.user.username,
      body: req.body.comment
    };
    Comment.create(newMessage, (err, createdComment) => {
      if (err) {
        console.log(err);
      } else {
        Post.findOne({ slug: req.params.slug })
          .populate("comments")
          .exec((err, post) => {
            if (err) {
              console.log(err);
            } else {
              post.comments.push(createdComment);
              post.save();
              req.flash("success", "Thank you for submitting you comment");
              res.redirect("/posts/" + req.params.slug);
            }
          });
      }
    });
  }
});

// Export Router
module.exports = router;
