const mongoose = require("mongoose");

// Creating a schema or structure of a collection (fields and their data types)
const userSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String
    },
    password: {
        type: String
    },
    age: {
        type: String
    },
    gender: {
        type: String
    }
})

// Creating a model (A models name starts with capital letter)
// Think of a model as a class of which different instances will be there database.
// For example, here User is a model and difference users will be instance of that User model.

// const User = mongoose.model("User", userSchema); // Commented since we are directly exporting the same below

module.exports = mongoose.model("User", userSchema);