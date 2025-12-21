const mongoose = require("mongoose");

const url =
  "mongodb+srv://namastenode:UxuPW9rUBXZHjBWC@namastenode.vdz6krc.mongodb.net/devTinder";

const connectDB = async () => {
  await mongoose.connect(url);
};

module.exports = connectDB;