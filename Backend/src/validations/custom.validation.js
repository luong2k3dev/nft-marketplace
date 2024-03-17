const validator = require('validator');

const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid id');
  }
  return value;
};

const email = (value, helpers) => {
  if (!validator.isEmail(value)) {
    return helpers.message('Email address is not valid');
  }
  return value;
};

const password = (value, helpers) => {
  if (value.length < 8) {
    return helpers.message('Password must contain at least 8 characters');
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    return helpers.message('Password must contain at least one letter and one number');
  }
  return value;
};

module.exports = {
  objectId,
  email,
  password,
};
