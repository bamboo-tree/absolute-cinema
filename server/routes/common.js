const router = require('express').Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const joi = require('joi')
const complexity = require('joi-password-complexity')


/*

  APIs:

  register - ok
  get_movie -
  get_reviews -


*/


// create new account
router.post('/register', async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username"),
      firstName: joi.string().required().label("First Name"),
      lastName: joi.string().required().label("Last Name"),
      email: joi.string().email().required().label("Email"),
      password: complexity().required().label("Password"),
      role: joi.string().valid('USER', 'ADMIN').label("Role")
    }).validate(req.body)

    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // get user with passed email or username
    const user = await User.findOne({
      $or: [
        { email: req.body.email },
        { username: req.body.username }
      ]
    });

    // check if user exists and return message
    if (user) {
      if (user.email === req.body.email) {
        return res.status(400).json({ message: "User with this email already exists." });
      }
      if (user.username === req.body.username) {
        return res.status(400).json({ message: "Username is taken." });
      }
    }

    // hash the password and create new user
    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    const newUser = await User({ ...req.body, password: hashPassword }).save()

    // create new token for user
    const token = newUser.generateAuthToken();
    res.status(200).send({ token: token, message: "User created successfully" })
    console.log("User created successfully")
  }
  catch (error) {
    console.error("Error while creating new account")
    res.status(500).send({ message: "Internal Server Error" })
  }
})


// get movie


// get reviews


module.exports = router