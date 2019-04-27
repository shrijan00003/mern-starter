const Validator = require("validator");
const isEmpty = require("../utils/ValidatorUtils");

const validateRegisterInput = data => {
  let errors = {};
  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be between 2 and 30 charecters";
  }
  return {
    errors,
    isValid: isEmpty(errors)
  };
};
module.exports = validateRegisterInput;
