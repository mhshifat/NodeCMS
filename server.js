// External Dependencies
const path = require("path");
const express = require("express");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const layout = require("express-ejs-layouts");
const passport = require("passport");

// Get App External Routes
const postsRoutes = require("./routes/posts");
const usersRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const catsRoutes = require("./routes/cats");
const commentRoutes = require("./routes/comment");

// Get Config Files
const config = require("./config/config");

// Connect Database
require("./database/conn");

// Passport
require("./config/passport")(passport);

// Call To The Express App
const app = express();

// Use External Dependencies As Middleware
app.use(layout);
app.use(
  session({
    secret: "Mehedi Hassan Shifat",
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
app.use(fileUpload());
app.use(cookieParser());
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("layout", "layouts/layout");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(passport.initialize());
app.use(passport.session());

// Custom Middleware
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  // res.send(req.user);
  next();
});

// Setup App Routes
app.use(postsRoutes);
app.use(commentRoutes);
app.use("/users", usersRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/categories", catsRoutes);

// Listening For Port
app.listen(config.port, () => {
  console.log(`==> The server is running on http://localhost:${config.port}`);
});
