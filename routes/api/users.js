const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");

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
          res.json({ msg: "success" });
        } else {
          res.status(400).json({
            password: "Password Incorrect"
          });
        }
      })
      .catch(err => console.log("Error on comparing password", err));
  });
});

module.exports = router;
