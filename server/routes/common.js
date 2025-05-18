const router = require('express').Router()
const { User, validate } = require('../models/User')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

// create new account
router.post('/register', async (req, res) => {
  try {
    // test if there are any errors
    const { error } = validate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // get user with passed email or username
    const existingUser = await User.findOne({
      $or: [
        { email: req.body.email },
        { username: req.body.username }
      ]
    });

    // check if user exists and return message
    if (existingUser) {
      if (existingUser.email === req.body.email) {
        return res.status(400).json({ message: "User with this email already exists." });
      }
      if (existingUser.username === req.body.username) {
        return res.status(400).json({ message: "Username is taken." });
      }
    }

    // hash the password and create new user
    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    await new User({ ...req.body, password: hashPassword }).save()

    res.status(201).send({ message: "User created successfully" })
  }
  catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router