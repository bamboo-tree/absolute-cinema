const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const bcrypt = require('bcrypt')
const passwordComplexity = require('joi-password-complexity')


const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  lastActive: {type: Date, required: false},
  role: {type: String, enum: ['user','admin'], required: true}
})

// ?
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.has(this.password, 10);
  }
  next();
})


UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
  return token;
}

const User = mongoose.model("User", UserSchema)


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