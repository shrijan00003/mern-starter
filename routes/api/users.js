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

//load register validator
const registerValidator = require("../../validation/RegisterValidator");
//load login validator
const loginValidator = require("../../validation/LoginValidator");

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
  const { errors, isValid } = registerValidator(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({
    email: req.body.email
  }).then(user => {
    if (user) {
      errors.email = "Email Already Exist";
      return res.status(400).json(errors);
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

  const { errors, isValid } = loginValidator(req.body);
  //check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  //find user by email
  User.findOne({ email }).then(user => {
    //check for user
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json(errors);
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
          errors.password = "Password Incorrect";
          res.status(400).json(errors);
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
