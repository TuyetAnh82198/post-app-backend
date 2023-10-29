const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParse = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");

const users = require("./routes/users.js");
const posts = require("./routes/posts.js");
const isAuth = require("./middleware/isAuth.js");

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": ["'self'", `${process.env.CLIENT_APP}`],
        "style-src": ["'self'", `${process.env.CLIENT_APP}`],
        "img-src": ["'self'", `${process.env.CLIENT_APP}`]
      },
    },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_APP,
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParse());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/users", users);
app.use("/posts", isAuth, posts);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@users.nyp2s8t.mongodb.net/post?retryWrites=true&w=majority`
  )
  .then((result) => {
    const io = require("./socket.js").init(
      app.listen(process.env.PORT || 5000, ()=>console.log("Server running"))
    );
    io.on("connect", (socket) => {
      socket.on("disconnect", () => {});
    });
  })
  .catch((err) => console.log(err));
