const express = require("express");
const { userAuth } = require("../middleware/auth");
const { validateEditProfileData } = require("../utils/validator");
const profileRouter = express.Router();
const User = require("../models/user");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid edit request");
    }

    const loggedInUser = req.user; // since we have chained user to req in middleware userAuth
    // console.log(loggedInUser);

    Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));

    console.log(loggedInUser);
    await loggedInUser.save();

    // res.send(`${loggedInUser.firstName}, your profile is updated successfully`);
    //Better way of writing above line of code
    res.json({
      message: `${loggedInUser.firstName}. your profile is updated successfully`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = profileRouter;
