// External Dependencies
const mongoose = require("mongoose");

// Creating a Post Model
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ],
  cats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cat"
    }
  ]
});

// Export Post Model
module.exports = mongoose.model("User", UserSchema);
