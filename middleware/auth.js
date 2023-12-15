const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.SECRET_KEY;

module.exports = (req, res, next) => {
  try {
    if (!req.session.userId) {
      throw "Invalid Request!";
    } else {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, secretKey);
      const userId = decodedToken.userId;
      console.log(req.session.userId);
      if (req.session.userId !== userId) {
        throw "Invalid user ID";
      } else {
        console.log("authorized!");
        next();
      }
    }
  } catch {
    res.status(401).json({
      error: new Error("Invalid request!"),
    });
  }
};
