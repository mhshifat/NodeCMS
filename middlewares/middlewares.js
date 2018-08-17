const needLogin = (req, res, next) => {
  if (!req.user) {
    req.flash("error", "Please log in first");
    res.redirect("/users/login");
  } else {
    next();
  }
};

const loggedIn = (req, res, next) => {
  if (req.user) {
    req.flash(
      "error",
      "You don't have permission as you are already logged in"
    );
    res.redirect("/admin/dashboard");
  } else {
    next();
  }
};

module.exports = { needLogin, loggedIn };
