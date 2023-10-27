const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  console.log(req.body.username);
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: await CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    // console.log(savedUser);
  } catch (err) {
    res.status(500).json(err);
    // console.log(err);
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username,
    });
    if (!user) res.status(401).json("Wrong No User");

    const inputPassword = req.body.password;

    const hashedPassword = await CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );

    const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    console.log(OriginalPassword, req.body.password);
    if (OriginalPassword !== inputPassword)
      res.status(401).json({ message: "Wrong Password!" });
    else {
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SEC,
        { expiresIn: "3d" }
      );

      const { password, ...others } = user._doc;

      res.status(200).json({ data: others, accessToken });
    }
  } catch (err) {
    res.status(500).json({ message: "Error " });
  }
});

module.exports = router;
