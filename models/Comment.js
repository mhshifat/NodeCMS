// External Dependencies
const mongoose = require("mongoose");

// Creating a Post Model
const CommentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Export Post Model
module.exports = mongoose.model("Comment", CommentSchema);
