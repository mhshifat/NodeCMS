// External Dependencies
const mongoose = require("mongoose");

// Creating a Post Model
const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  cat: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  allowComment: {
    type: Boolean,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

// Export Post Model
module.exports = mongoose.model("Post", PostSchema);
