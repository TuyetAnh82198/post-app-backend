const jwt = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  if (!req.cookies.user) {
    return res.redirect(`${process.env.CLIENT_APP}/login`);
  } else {
    jwt.verify(req.cookies.user, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(400).json({
          message: "Your login session has expired, please log in again",
        });
      } else {
        // console.log("middleware");
        req.user = decoded;
        next();
      }
    });
  }
};

module.exports = isAuth;
