const mongoose = require("mongoose");
const validator = require("validator");

// Creating a schema or structure of a collection (fields and their data types)
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid email: "+ value);
            }
        }
    },
    password: {
        type: String,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("Enter a strong password");
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate: function (value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Invalid Gender!");
            }
        }
    },
    photoUrl: {
        type: String,
        // validate(value) {
        //     if (!validator.isURL(value)) {
        //         throw new Error("Invalid Photo URL: " + value);
        //     }
        // }
    },
    about: {
        type: String,
        default: "This is default info of the user!"
    },
    skills: {
        type: [String]
    }
}, {timestamps: true})

// Creating a model (A models name starts with capital letter)
// Think of a model as a class of which different instances will be there database.
// For example, here User is a model and difference users will be instance of that User model.

// const User = mongoose.model("User", userSchema); // Commented since we are directly exporting the same below

module.exports = mongoose.model("User", userSchema);