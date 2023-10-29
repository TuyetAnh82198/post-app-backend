const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UsersModel = require("../models/User.js");

//hàm xử lý việc đăng ký
const signup = async (req, res) => {
  try {
    const errors = validationResult(req);
    const err = [];
    errors.array().forEach((error) => {
      err.push({ msg: error.msg, path: error.path });
    });
    // console.log(err);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: err });
    } else {
      const existingUser = await UsersModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(409).json({ err: [], message: "Existing user!" });
      } else {
        const newUser = new UsersModel({
          email: req.body.email,
          pass: bcrypt.hashSync(req.body.pass, 8),
          name: req.body.name,
        });
        await newUser.save();
        return res.status(201).json({ err: [], message: "Created!" });
      }
    }
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
//hàm xử lý việc đăng nhập
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    const err = [];
    errors.array().forEach((error) => {
      err.push({ msg: error.msg, path: error.path });
    });
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: err });
    } else {
      const existingUser = await UsersModel.findOne({ email: req.body.email });
      if (existingUser) {
        const correctPass = bcrypt.compareSync(
          req.body.pass,
          existingUser.pass
        );
        if (correctPass) {
          const token = jwt.sign(
            { email: existingUser.email },
            process.env.JWT_SECRET,
            {
              expiresIn: "1d",
            }
          );
          res.cookie("user", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: false,
            // secure: false,
          });
          return res
            .status(200)
            .json({ err: [], message: "You are logged in!" });
        } else {
          return res
            .status(400)
            .json({ err: [], message: "Wrong email or password" });
        }
      } else {
        return res
          .status(400)
          .json({ err: [], message: "Wrong email or password" });
      }
    }
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
//hàm kiểm tra người dùng đã đăng nhập chưa
const checkLogin = (req, res) => {
  try {
    // console.log(req.cookies.user);
    jwt.verify(req.cookies.user, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(200).json({ message: "have not been logged in yet" });
      } else {
        res.status(200).json({ message: "You are logged in" });
      }
    });
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
//hàm xử lý việc đăng xuất
const logout = (req, res) => {
  try {
    res.clearCookie("user");
    return res.status(200).json({ message: "You are logged out!" });
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
module.exports = { signup, login, checkLogin, logout };
