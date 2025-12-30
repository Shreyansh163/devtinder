const express = require("express");
// const { adminAuthuth, adminAuth } = require("./middleware/auth");
require("./config/database");
const connectDB = require("./config/database");

const { validateSignupData } = require("./utils/validator");

const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express(); // creating an instance of express.js application

const User = require("./models/user"); // Importing the User model

const { userAuth } = require("./middleware/auth");

// Writing like this makes it applicable to all the routes("/"") for application which means for all the requests. We don't need to write it again for parsing anymore.
app.use(express.json());

// Enabling cookie parser for all routes using app.use()
app.use(cookieParser());

app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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
        expires: new Date(Date.now() + 8 * 3600000)
      }); // cookie will expire in 8 days
      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// Profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

// Fetch a user from the database using their emailId
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    console.log(userEmail);
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

// Fetch all users from database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.status(404).send("Users not found");
    } else {
      res.send(users);
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

// Delete a user by Id
app.delete("/user", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

// Update data of a user
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;
  try {
    // Restricting updates like email and allowing other updates
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every(k =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    // Restricting max skills a user can submit to 10
    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    await User.findByIdAndUpdate({ _id: userId }, data, {
      runValidators: true,
    });
    res.send("User updated successfully");
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection successful");

    // listen method accepts a port number and a callback function that executes only when server is running successfully on passed port number
    // We should connect the database before starting application on a certain port that why we are passing here because when connectDB promise resolve and database is successfully connected then we start application.
    app.listen(7777, () => {
      console.log("Server is successfully running on port 7777 ...");
    });
  })
  .catch(err => {
    console.log("Database connection failed");
  });

// ====================================================

// app.use("route", RouteHandler function)

// Routehandler function syntax:
// (err, req, res, next) => {}
// Order of parameters matter here.
// If we pass two arguments, first will be req, second will be res.
// If we pass three arguments, first will be req, second will be res and third will be next.
// If we pass four arguments, first will be err, second will be req, third will be res and fourth will be next.

// app.get("/user", (req, res) => {
//     console.log(req.query); // Query parameter /user?shrey
//     res.send("Shreyansh");
// })

// app.get("/user/:userId/:name/:password", (req, res) => {
//     console.log(req.params);
//     res.send("babu")
// })

// app.use("/", (req, res) => {
//     res.send("Namaste Nodejs");
// })

// app.use("/hello", (req, res) => {
//     res.send("Hello From Server")
// })

// app.use("/test", (req,res) => {
//     res.send("Testing server!")
// })

// Order in which routes are used matters: In the above scenario there are 3 routes: "/", "/hello", "/test" but all routes resolve to same response i.e. "Namaste Nodejs". Since that route is used first in the code and all three routes start with same slash.

// The order in which you write routes is very important in Express. Routes are matched top to bottom, and the first match is executed.

// ============Middleware=========

// app.use("/admin", adminAuth);

// app.get("/admin/getAllData", (req, res) => {
//   try {
//     console.log("All data fetched");
//     res.send("ALL DATA");
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });
