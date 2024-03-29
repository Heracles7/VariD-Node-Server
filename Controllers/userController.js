const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

exports.create_user = async function (req, res) {
  console.log(req.body);
  const data = new User({
    username: req.body.username,
    role: req.body.role,
    mail: req.body.mail,
    password: req.body.password,
    language: req.body.language,
  });
  try {
    const dataToSave = await data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.login_user = async function (req, res) {
  console.log(req.body.username);
  const data = await User.findOne({ username: req.body.username }).exec();
  console.log(data);
  if (!data) {
    res
      .status(400)
      .json({ message: "user " + req.body.username + " doesn't exist." });
  } else {
    try {
      const match = await bcrypt.compare(req.body.password, data.password);
      if (match) {
        const token = jwt.sign({ userId: data._id }, secretKey, {
          expiresIn: "24h",
        });
        req.session.userId = data._id;
        res.status(200).json({
          userId: data._id,
          token: token,
        });
        // res.status(200).json({
        //   message: "user " + req.body.username + " logged in succesfully",
        //   role: data.role,
        // });
      } else {
        res.status(400).json({ message: "password doesn't match" });
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};
/*exports.login_user = function(req, res) {
        User.findOne({username: req.body.username}).exec(function(error, user) {
            if (error) {
                res.status(500).json({message: "An error processing the data occurred"})
            } else if (!user) {
                res.status(200).json({message: "user "+req.body.username+" doesn't exist."})
            } else {
                user.comparePassword(req.body.password, function(matchError, isMatch) {
                    if (matchError) {
                        res.status(200).json({message: "Wrong password."})
                    } else if (!isMatch) {
                        res.status(200).json({message: "Wrong password."})
                    } else {
                        res.status(200).json({message: "Success", role: User.role})
                    }
                })
            }
        })
    }*/
