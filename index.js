const express = require("express");
const path = require("path");
const userRoutes = require("./routes/user");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 3000;

mongoose
  .connect("mongodb://127.0.0.1:27017/daily-blogs")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((error) => {
    console.log(`Error while connecting to mongo DB: ${error}`);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is successfully running on ${port}`);
});
