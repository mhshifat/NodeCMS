// External Dependencies
const mongoose = require("mongoose");

// Creating a Post Model
const CatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Export Post Model
module.exports = mongoose.model("Cat", CatSchema);
