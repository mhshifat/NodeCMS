// External Dependencies
const express = require("express");

// Setup Router
const router = express.Router();

// Get Models
const Post = require("../models/Post");
const Cat = require("../models/Cat");

// Route Get: /
router.get("/", (req, res) => {
  Post.find({})
    .count()
    .exec((err, count) => {
      if (err) {
        console.log(err);
      } else {
        const perPage = 5;
        const currentPage = req.query.page || 1;
        if (req.query.page > Math.ceil(count / currentPage)) {
          res.send("Page Not Found!");
        } else {
          Post.find({})
            .sort({ date: -1 })
            .limit(perPage)
            .skip(perPage * currentPage - perPage)
            .exec((err, allPosts) => {
              if (err) {
                console.log(err);
              } else {
                Cat.find({}, (err, allCats) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.render("pages/posts", {
                      posts: allPosts,
                      currentPage,
                      count: Math.ceil(count / perPage),
                      cats: allCats
                    });
                  }
                });
              }
            });
        }
      }
    });
});

// Route Get: /posts/:slug
router.get("/posts/:slug", (req, res) => {
  Post.findOne({ slug: req.params.slug })
    .populate("comments")
    .exec((err, foundPost) => {
      if (err) {
        console.log(err);
      } else {
        Cat.find({}, (err, allCats) => {
          if (err) {
            console.log(err);
          } else {
            res.render("pages/posts/post", { post: foundPost, cats: allCats });
          }
        });
      }
    });
});

// Export Router
module.exports = router;
