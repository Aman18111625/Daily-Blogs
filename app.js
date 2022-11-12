require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieparser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");
const { LocalStorage } = require("node-localstorage");

const app = express();

app.use(helmet());
app.use(cookieparser());

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//connection to mongoDB
mongoose.connect("mongodb+srv://guptaji997:aman18111625@cluster0.qhsowva.mongodb.net/Daily-Blogs?retryWrites=true&w=majority", { useNewUrlParser: true }, () => {
  console.log("db connected");
});

let userLogged = false;
const homeStartingContent =
  "lorem espopahgsdjhfa hfaudsoihdsn sdaou;idnmdsansfodin sadhfdskhjhfds";
const aboutContent =
  "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent =
  "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

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

var localStorage = new LocalStorage("./scratch");

app.get("/", function (req, res) {
  res.render("signup");
});

app.get("/signup", async (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;

    const found = await User.findOne({ email: email });

    if (found) {
      userLogged=false;
      console.log("User Already Exists!");
      res.redirect("/login");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        email: email,
        password: hashedPassword,
      });
      console.log("Registration Successfull");
      user.save();
      userLogged = true;
      Post.find({}, function (err, posts) {
        res.render("home", {
          startingContent: homeStartingContent,
          posts: posts,
          userLogged: userLogged,
        });
      });
    }
  } catch (error) {
    console.log("Registration Failed!");
    res.render("signup");
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
      userLogged=false;
      console.log("User does not exist");
      res.redirect("/signup");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        userLogged=false;
        console.log("Invalid Credentials");
        res.redirect("/login");
      } else {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
        userLogged = true;
        console.log("UserLoggedIn:" + userLogged);
        Post.find({}, function (err, posts) {
          res.render("home", {
            startingContent: homeStartingContent,
            posts: posts,
            userLogged: userLogged,
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
  userLogged = false;
  localStorage.clear();
  res.redirect("/login");
});

app.get("/home", async function (req, res) {
  const email = localStorage.getItem("email");
  console.log(email);

  if (email === null) {
    userLogged=false;
    console.log("Please Log-in first");
    res.redirect("/login");
  } else {
    Post.find({}, function (err, posts) {
      console.log("Authorization successful");
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts,
        userLogged: userLogged,
      });
    });
  }
});

app.get("/compose", function (req, res) {
  const email = localStorage.getItem("email");
  console.log(email);

  if (email === null) {
    userLogged=false;
    console.log("Please Log-in first");
    res.redirect("/login");
  } else {
    res.render("compose",{userLogged:userLogged});
  }
});

app.post("/compose", async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  await post.save((err) => {
    if (err){
      res.render("compose",{userLogged:userLogged});
    }else{
      res.redirect("/home");
    }
  });
});

app.get("/posts/:postTitle", async (req, res) => {
  const email = localStorage.getItem("email");

  if (email === null) {
    userLogged=false;
    console.log("please login first");
    res.redirect("/login");
  } else {
    const requestedPostTitle = req.params.postTitle;

    await Post.findOne({ title: requestedPostTitle }, function (err, post) {
      if (err) {
        console.log(err);
      } else {
        res.render("post", {
          title: post.title,
          content: post.content,
          userLogged: userLogged,
        });
      }
    });
  }
});

app.get("/about", async (req, res) => {
  res.render("about", { aboutContent: aboutContent });
});

app.get("/contact", async (req, res) => {
  res.render("contact", {
    contactContent: contactContent,
  });
});

const port = 3000;

app.listen(3000, async () => {
  console.log("Server started on port 3000");
});
