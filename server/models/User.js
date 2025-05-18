const mongose = require('mongoose')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const complexity = require('joi-password-complexity')


// TODO: last active
const userSchema = new mongose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
})

userSchema.methods.generateAuthToken = function () {
  if (!process.env.JWTPRIVATEKEY) {
    throw new Error("JWTPRIVATEKEY is not defined");
  }

  return jwt.sign(
    { _id: this._id },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
};

const validate = (data) => {
  const schema = joi.object({
    username: joi.string().required().label("Username"),
    firstName: joi.string().required().label("First Name"),
    lastName: joi.string().required().label("Last Name"),
    email: joi.string().email().required().label("Email"),
    password: complexity().required().label("Password"),
    role: joi.string().valid('USER', 'ADMIN').label("Role")
  })
  return schema.validate(data)
}

const User = mongose.model("User", userSchema)

module.exports = { User, validate }