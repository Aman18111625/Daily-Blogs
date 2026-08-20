require("dotenv").config();
const express = require("express");
const path = require("path");
const userRoutes = require("./routes/user");
const blogRoutes = require("./routes/blog");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const {
  checkForAuthenticationCookie,
} = require("./middlewares/authentication");
const Blog = require("./models/blog");
const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid number between 1 and 65535");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is required");
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({}).sort({ createdAt: -1 });
  res.render("home", {
    user: req.user,
    blogs: allBlogs
  });
});

app.use("/user", userRoutes);

app.use("/blog", blogRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    user: req.user,
    status: 404,
    message: "Page not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  const status = error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 400 : 500);
  res.status(status).render("error", {
    user: req.user,
    status,
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : error.message,
  });
});

async function startServer() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB Connected");
  app.listen(port, () => {
    console.log(`Server is successfully running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exitCode = 1;
});
