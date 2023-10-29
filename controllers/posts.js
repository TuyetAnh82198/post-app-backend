const PostModel = require("../models/Post.js");
const io = require("../socket.js");

//hàm lưu bài đăng và ảnh vào cơ sở dữ liệu
//và gửi phản hồi cho client
const post = async (req, res) => {
  try {
    //validate đầu vào thêm 1 lần
    if (req.body.title === "" || req.body.content === "") {
      return res.status(400).json({ message: "Please enter a valid value" });
    } else if (!req.file) {
      return res.status(400).json({ message: "jpg, jpeg, png accepted" });
    } else {
      const email = req.user.email;
      const newPost = new PostModel({
        title: req.body.title,
        content: req.body.content,
        image: req.file.path,
        email: email,
        date: new Date(),
      });
      await newPost.save();
      const posts = await PostModel.find();
      io.getIO().emit("posts", { action: "post", postResult: posts });
      return res.status(201).json({ message: "Posted!" });
    }
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}}/server-error`);
  }
};
const getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find();
    return res.status(200).json({ result: posts });
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
//hàm cập nhật bài đăng và ảnh trong cơ sở dữ liệu
//và gửi phản hồi cho client
const updatePost = async (req, res) => {
  try {
    //validate đầu vào thêm 1 lần
    if (req.body.title === "" || req.body.content === "") {
      return res.status(400).json({ message: "Please enter a valid value" });
    } else if (!req.file) {
      return res.status(400).json({ message: "jpg, jpeg, png accepted" });
    } else {
      await PostModel.updateOne(
        { _id: req.body.id },
        {
          title: req.body.title,
          content: req.body.content,
          image: req.file.path,
        }
      );
      const posts = await PostModel.find();
      io.getIO().emit("posts", { action: "update", updateResult: posts });
      return res.status(200).json({ message: "Updated!" });
    }
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};
const deletePost = async (req, res) => {
  try {
    await PostModel.deleteOne({ _id: req.params.id });
    const posts = await PostModel.find();
    io.getIO().emit("posts", { action: "delete", deleteResult: posts });
    return res.status(200).json({ message: "Deleted!" });
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_APP}/server-error`);
  }
};

module.exports = { post, getPosts, updatePost, deletePost };
