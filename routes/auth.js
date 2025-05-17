const express = require("express");
const router = express.Router();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = require("../models/user");
const secretKey = process.env.JWT_SECRET;
const authMiddleware = require("../middleware/authMiddleware");

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
        id: newUser._id,
        username: newUser.username,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Both fields are required" });
  }

  try {
    const existingUser = await user.findOne({ username });

    if (
      !existingUser ||
      !(await bcrypt.compare(password, existingUser.password))
    ) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: existingUser._id, username: existingUser.username },
      secretKey,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
        firstname: existingUser.firstname,
        lastname: existingUser.lastname,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  const { password, firstname, lastname } = req.body;

  if (!password || !firstname || !lastname) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  try {
    await user.updateOne({ _id: req.userId }, req.body);

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Error while proceeding request" });
  }
});

module.exports = router;
