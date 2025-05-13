const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')


router.post("/", async (req, res) => {
    res.status(200).send("works fine")
})

router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.send({ token });
  } catch (error) {
    res.status(422).send(error.message)
  }
});

router.post('/login', async (req, res) => {
  // TODO: login logic
});

module.exports = router