const express = require("express");
const { validateSignupData } = require("../utils/validator");
const bcrypt = require("bcrypt");
const User = require("../models/user"); // Importing the User model

const authRouter = express.Router();

//signup
authRouter.post("/signup", async (req, res) => {
  // Always wrap in try catch blocks for better error handling
  try {
    // Validate signup data
    validateSignupData(req);

    // encrypting the password
    const { password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const {
      firstName,
      lastName,
      emailId,
      age,
      gender,
      about,
      photoUrl,
      skills,
    } = req.body;

    // Dynamically creating a new instance of User model from request
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      photoUrl,
      about,
      skills,
    });

    // saving data to the database
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
});

// Login
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Create a JWT(JSON Web Token) - Install jsonwebtoken and import then use it here
      // What is JWT token?
      // JSON Web Token are an open industry standard method for representing claims securely between two parties.
      // JWT decoded: Header, Payload and Signature
      // Install jsonwebtoken package from npm library

      const token = await user.getJWT();
      console.log(token);

      // Add the token to cookie then send cookie back to user

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      }); // cookie will expire in 8 days
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// logout
authRouter.post("/logout", async (req, res) => {
  // Sometime we need to do some cleanus while logging out along with clearing the token
  res.cookie("token", null, {
    expires: new Date(Date.now())
  });
  res.send("Logout Successful");
  // We can chain above methods: res.cookie().send();
})

module.exports = authRouter;