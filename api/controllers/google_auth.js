/* controllers/auth-routes.js */

/* Dependencies */
const router = require("express").Router();
const passport = require("../config/passport");

/* Route to start OAuth2 authentication */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email"],
  })
);

/* Callback route for OAuth2 authentication */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication
    console.log(req.user);
    req.session.save(() => {
      res.redirect("/");  // Edit for correct redirect link
    });
  }
);

/* EXPORTS */
module.exports = router;
