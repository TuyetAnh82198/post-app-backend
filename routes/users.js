const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/isAuth.js");

const {
  signup,
  login,
  checkLogin,
  logout,
} = require("../controllers/users.js");

const route = express.Router();

route.post(
  "/signup",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("name").trim().notEmpty().withMessage("Name cannot be empty"),
    body("pass")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty")
      .isLength({ min: 8 })
      .withMessage("Password must be more than 8 chars"),
  ],
  signup
);
route.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email cannot be empty")
      .isEmail()
      .withMessage("Please enter a valid email"),
    body("pass").trim().notEmpty().withMessage("Password cannot be empty"),
  ],
  login
);
route.get("/check-login", checkLogin);
route.get("/logout", isAuth, logout);

module.exports = route;
