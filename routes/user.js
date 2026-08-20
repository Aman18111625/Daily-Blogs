const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.post("/signup", async (req, res) => {
  const fullName = req.body.fullName?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!fullName || !email || !password || password.length < 8) {
    return res.status(400).render("signup", {
      error: "Name, email, and a password of at least 8 characters are required",
    });
  }

  try {
    await User.create({ fullName, email, password });
    return res.redirect("/user/signin");
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).render("signup", {
        error: "An account with that email already exists",
      });
    }
    throw error;
  }
});

router.post("/signin", async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .redirect("/");
  } catch (err) {
    return res.status(401).render("signin", {
      error: "Invalid credentials",
    });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.redirect("/");
});

module.exports = router;
