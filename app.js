require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const homeStartingContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

//connection to mongoDB
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true }, () => {
  console.log("db connected");
});

//user schema
const userSchema = mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

//post schema
const postSchema = {
  title: String,
  content: String,
};
const Post = mongoose.model("Post", postSchema);

app.get("/", function (req, res) {
  res.render("register");
});

app.get("/register", async (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    const found = await User.findOne({ email: email });

    if (found) {
      console.log("User Already Exists!");
      res.render("login");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      // console.log("Registration Successfull")
      user.save();
      Post.find({}, function (err, posts) {
          res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
        });
      });
    }
  } catch (error) {
    console.log("Registration Failed!");
    res.render("register");
  }
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log("User does not exist");
      res.render("login");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Invalid Credentials");
        res.render("login");
      } else {
        Post.find({}, function (err, posts) {
            res.render("home", {
            startingContent: homeStartingContent,
            posts: posts,
          });
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server error Occured");
  }
});

app.get("/logout", async (req, res) => {
  res.logout();
  res.render("login");
});

app.get("/home", function (req, res) {
  Post.find({}, function (err, posts) {
      res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
    });
  });
});

app.get("/compose", function (req, res) {
   res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/home");
    }
  });
});

app.get("/posts/:postTitle", function (req, res) {
  const requestedPostTitle = req.params.postTitle;

  Post.findOne({ title: requestedPostTitle }, function (err, post) {
    if (err) {
      console.log(err);
    } else {
        res.render("post", {
        title: post.title,
        content: post.content,
      });
    }
  });
});

app.get("/about", function (req, res) {
   res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", function (req, res) {
   res.render("contact", { contactContent: contactContent });
});

app.listen(process.env.PORT, function () {
  console.log("Server started on port 3000");
});
