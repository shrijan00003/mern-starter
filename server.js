const express = require("express");
const mongoose = require("mongoose");

const app = express();

//DB CONFIG
const db = require("./config/keys").mongoURI;

// connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected"))
  .catch(() => console.log("error"));

app.get("/", (req, res) => res.send("hello!!!"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
