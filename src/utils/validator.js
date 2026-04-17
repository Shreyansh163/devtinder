const validator = require("validator");

function validateSignupData(req) {
  const { firstName, lastName, emailId, password } = req.body;

  console.log(firstName);

  if (!firstName || !lastName) {
    throw new Error("Invalid name");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter a strong password");
  }
}

function validateEditProfileData(req) {
  let ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "age",
    "about",
    "gender",
    "photoUrl",
    "skills",
  ];
    
    let isUpdateAllowed = Object.keys(req.body).every(field => ALLOWED_UPDATES.includes(field));
    return isUpdateAllowed;
}

module.exports = {
  validateSignupData,
  validateEditProfileData,
};
