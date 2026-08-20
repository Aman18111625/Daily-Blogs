const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const Comment = require("../models/comment");
const router = express.Router();
const uploadDirectory = path.join(__dirname, "../public/uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

function requireAuthentication(req, res, next) {
  if (!req.user) {
    return res.redirect("/user/signin");
  }
  next();
}

router.get("/add-new", requireAuthentication, (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname).toLowerCase();
    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image uploads are allowed");
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

router.post("/", requireAuthentication, upload.single("coverImage"), async (req, res) => {
  if (!req.body.title?.trim() || !req.body.body?.trim() || !req.file) {
    const error = new Error("Title, content, and a cover image are required");
    error.statusCode = 400;
    throw error;
  }

  const blog = await Blog.create({
    title: req.body.title.trim(),
    body: req.body.body.trim(),
    coverImageUrl: `/uploads/${req.file.filename}`,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${blog._id}`);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).render("error", {
      user: req.user,
      status: 404,
      message: "Blog not found",
    });
  }

  const blog = await Blog.findById(req.params.id).populate(
    "createdBy",
    "_id fullName profileImageUrl",
  );
  if (!blog) {
    return res.status(404).render("error", {
      user: req.user,
      status: 404,
      message: "Blog not found",
    });
  }
  const comments = await Comment.find({ blogId: req.params.id }).populate(
    "createdBy",
    "_id fullName profileImageUrl",
  );
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blogId", async (req, res) => {
  if (!req.user) {
    return res.redirect("/user/signin");
  }
  if (!mongoose.isValidObjectId(req.params.blogId)) {
    return res.status(404).render("error", {
      user: req.user,
      status: 404,
      message: "Blog not found",
    });
  }
  if (!req.body.content?.trim()) {
    return res.status(400).render("error", {
      user: req.user,
      status: 400,
      message: "Comment cannot be empty",
    });
  }

  await Comment.create({
    content: req.body.content.trim(),
    createdBy: req.user._id,
    blogId: req.params.blogId,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
