const jwt = require("jsonwebtoken");
const User = require("../models/user");

const adminAuth = (req, res, next) => {
  console.log("admin auth is getting checked!");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.status(401).send("Unauthorized request");
  } else {
    next();
    // next function is used to call next handler in an api
  }
};

const userAuth = async (req, res, next) => {
  try {
    // Read the request from the req cookies
    const { token } = req.cookies;
    if (!token) {
      res.status(401).send("Please Login!");
    }
    // Validate the token
    const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);
    // Find the username
    const { _id } = decodedObj;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    // Chaining user to the req of next handler to be accssed in profile and other apis
    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
