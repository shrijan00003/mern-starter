const Validator = require("validator");
const isEmpty = require("../utils/ValidatorUtils");

const validateRegisterInput = data => {
  let errors = {};
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 charecters";
  }
  if (Validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be atlease 6 charecters";
  }
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }
  if (!Validator.equals(data.password2, data.password2)) {
    errors.password2 = "Password should match";
  }
  if (!Validator.isLength(data.password2, { min: 6, max: 30 })) {
    errors.password2 = "Confirm Password is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
module.exports = validateRegisterInput;
