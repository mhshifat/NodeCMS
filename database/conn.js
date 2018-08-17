// External Dependencies
const mongoose = require("mongoose");

// Get Environment Variables
require("dotenv").config();

// Export And Connect Database
module.exports = mongoose.connect(
  process.env.MONGODB_URI,
  {
    useNewUrlParser: true
  },
  () => {
    console.log(`==> A database connection has been eshtablished`);
  }
);
