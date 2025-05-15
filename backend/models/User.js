const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const joi = require('joi')

const UserSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  lastActive: {type: Date, required: false},
  role: {type: String, enum: ['user','admin'], required: true}
})

// generate hash from password
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

const validate = (data) => {
  const schema = joi.object({
    username: joi.string().required().label("Username"),
    firstName: joi.string().required().label("First Name"),
    lastName: joi.string().required().label("Last Name"),
    email: joi.string().required().label("Email"),
    password: joi.string().required().label("Password") // there should be something like password complexity, but it will make testing more annoying so its just a string
  })
  return schema.validate(data)
}


const User = mongoose.model("User", UserSchema)
module.exports = { User, validate }