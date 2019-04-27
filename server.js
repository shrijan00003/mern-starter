const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//routes files
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//main app
const app = express();

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB CONFIG
const db = require("./config/keys").mongoURI;

// connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected"))
  .catch(() => console.log("error"));

app.get("/", (req, res) => res.send("hello!!!"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

//defining port
const port = process.env.PORT || 5000;
//listen to port
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
