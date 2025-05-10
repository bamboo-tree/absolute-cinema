const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const passwordComplexity = require('joi-password-complexity')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, required: true},
  lastActive: {type: Date, required: false},
  role: {type: String, enum: ['user','admin'], required: true}
})

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" })
  return token;
}

const User = mongoose.model("User", userSchema)

const validate = (data) => {
  const schema = joi.object({
    username: joi.string().required().label("Username"),
    firstName: joi.string().required().label("First Name"),
    lastName: joi.string().required().label("Last Name"),
    email: joi.string().required().label("Email"),
    password: passwordComplexity().required().label("Password")
  })
  return schema.validate(data)
}

module.exports = { User, validate }