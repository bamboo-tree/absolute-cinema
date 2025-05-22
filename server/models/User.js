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

// generate JWT token to access sites and functionalities for logged clients only
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      role: this.role,
      username: this.username
    },
    process.env.JWTPRIVATEKEY,
    { expiresIn: "7d" }
  );
};

// index username faster search
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema)
module.exports = User