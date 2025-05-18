const router = require('express').Router()
const bcrypt = require('bcrypt');
const joi = require('joi')


const { User, validate } = require('../models/User')
const authenticateToken = require('../middleware/authorized')


// authenticate
router.post('/authenticate', async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username"),
      password: joi.string().required().label("Password"),
    }).validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // find user by username
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser)
      return res.status(401).send({ message: "Invalid Email or Password" })

    // check password
    const validPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    )
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" })

    // create new token for user
    const token = existingUser.generateAuthToken();
    res.status(200).send({ data: token, message: "Logged in successfully" })
  }
  catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})



// read account data
router.post('/read', authenticateToken, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username")
    }).validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // get user by username and skip password
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // send user data
    res.status(200).json(user);
  }
  catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
})


// update account data


// delete account


module.exports = router