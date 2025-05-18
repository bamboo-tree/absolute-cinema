const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
})

// generate JWT token to access sites and functionalities for users only
userSchema.methods.generateAuthToken = function () {
  if (!process.env.JWTPRIVATEKEY)
    throw new Error("JWTPRIVATEKEY is not defined");

  return jwt.sign(
    { _id: this._id },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("User", userSchema)
module.exports = User