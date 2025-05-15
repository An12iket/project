const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const secretKey = process.env.JWT_SECRET;

router.post("/signup", async (req, res) => {
  const { username, password, firstname, lastname } = req.body;

  if (!username || !password || !firstname || !lastname) {
    return res.status(400).json({ message: "All fields are required !" });
  }

  try {
    const existingUser = await user.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await user.create({
      username,
      password: hashPassword,
      firstname,
      lastname,
    });

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      secretKey,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
        token,
        user: {
            id : newUser._id,
            username: newUser.username,
            firstname: newUser.firstname,
            lastname: newUser.lastname
        }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", (req, res) => {
    
});

module.exports = router;
