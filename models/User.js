const mongoose = require("mongoose");
const Schema = mongoose.schema;

//Create Schema

const UserSchema = new Schema({
  name: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  avatar: {
    type: String,
    require: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// first of all assign to User variable and create a model with UserSchema we have created so far
module.exports = User = mongoose.model("users", UserSchema);
