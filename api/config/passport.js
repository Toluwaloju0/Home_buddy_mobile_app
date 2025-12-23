/* config/passport.js */

/* Dependencies */
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");  // Import your user model

/* Passport Middleware */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,  // Client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,  // Client secret
      callbackURL: "https://your-site.com/auth/google/callback",
    },
    async function (token, tokenSecret, profile, done) {
      try {
        console.log(profile);
        const [user, created] = await User.findOrCreate({
          where: {
            googleId: profile.id,
          },
          defaults: {
            // Initialize necessary fields in User model here, like this:
            first: profile.name.givenName,
            last: profile.name.familyName,
            email: profile.emails[0].value,
          },
        });
        return done(null, traveler);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* How to store the user information in the session */
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

/* How to retrieve the user from the session */
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/* Exporting Passport Configuration */
module.exports = passport;