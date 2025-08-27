const express = require("express");

const app = express(); // creating an instance of express.js application

// app.use((req, res) => {
//     res.send("Hello from the server!")
// })

app.use("/test", (req,res) => {
    res.send("Testing server!")
})

app.listen(3000, () => {
    console.log("Server is successfully running on port 3000 ...");
}); // listen method accepts a port number and a callback function that executes only when server is running successfully on passed port number