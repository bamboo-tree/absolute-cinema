// both for registered and not registered users

const router = require('express').Router()
const { User, validate } = require('../models/User')
const bcrypt = require('bcrypt')

router.post('/', async (res, req) => {
  try {
    const { error } = validate(req.body)
    if (error) {
      return res.statusCode(400).send({ message: error.details[0].message })
    }

    const userEmail = await User.findOne({ email: req.body.email })
    if (userEmail) {
      return res.statusCode(409).send({ message: "User with this email already exists" })
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    await new User({ ...req.body, password: hashPassword }).save()
    res.statusCode(201).send({ message: "User created successfully" })
  } catch (error) {
    res.statusCode(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router