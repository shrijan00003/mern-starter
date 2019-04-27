const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

//router instance
const router = express.Router();

//load user model
const User = require("../../models/User");

/**
 * @route GET api/users/test
 * @description Test users route
 * @access Public
 */
router.get("/test", (req, res) => {
  res.json({
    msg: "user works"
  });
});

/**
 * @route GET api/users/register
 * @description Register user
 * @access Public
 */

router.post("/register", (req, res) => {
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      return res.status(400).json({
        email: "Email Already Exist"
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size
        r: "pg", //Rating
        d: "mm"
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      // 10 is salt length
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log("error on saving user", err));
        });
      });
    }
  });
});

/**
 * @route GET api/users/login
 * @description Login User/ Returning JWT Token
 * @access Public
 */

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  //find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      return res.status(404).json({
        email: "User not found"
      });
    }
    //check password
    bcrypt
      .compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          //user is matched
          //payoload for jwt
          const payload = {
            id: user.id,
            name: user.name
          };
          //sign token
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              if (!err) {
                res.json({
                  success: true,
                  token: `Bearer ${token}`
                });
              }
            }
          );
          //   res.json({ msg: "success" });
        } else {
          res.status(400).json({
            password: "Password Incorrect"
          });
        }
      })
      .catch(err => console.log("Error on comparing password", err));
  });
});

/**
 * @route GET api/users/current
 * @description Return current user
 * @access Private
 */

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      msg: "success on passport implementation",
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
      }
    });
  }
);

module.exports = router;
