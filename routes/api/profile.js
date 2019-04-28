const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

mongoose.set("useFindAndModify", false);

//import profile and user model
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const validateProfileInput = require("../../validation/ProfileValidator");

/**
 * @route GET api/profile/test
 * @description Test profile route
 * @access Public
 */
router.get("/test", (req, res) => {
  res.json({
    msg: "proflie works"
  });
});

/**
 * @route GET api/profile/
 * @description Get Current user Profile
 * @access Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json({ err }));
  }
);
/**
 * @route POST api/profile/
 * @description create or update the user profile
 * @access Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //validate
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    //splits skills into array
    if (typeof req.body.skills !== undefined) {
      profileFields.skills = req.body.skills.split(",");
    }
    //social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          //update will happen here
          Profile.findOneAndUpdate(
            { user: req.user.id },
            {
              $set: profileFields
            },
            { new: true }
          )
            .populate("user", ["name", "avatar"])
            .then(updatedProfile => res.json(updatedProfile))
            .catch(err => {
              errors.msg = "Error in updating profile";
              errors.error = err;
              res.status(400).json(errors);
            });
        } else {
          //create
          //check if handle exists
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = "That handle already exists";
              res.status(400).json(errors);
            }
            //save profile
            new Profile(profileFields)
              .save()
              .then(newProfile => req.json(newProfile))
              .catch(err => {
                errors.msg = `Error in creating profile`;
                errors.error = err;
                res.status(400).json(errors);
              });
          });
        }
      })
      .catch(err => {
        errors.msg = "Erros in finding Profile";
        errors.error = err;
        res.status(400).json(errors);
      });
  }
);

module.exports = router;
