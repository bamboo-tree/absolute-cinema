const router = require('express').Router()
const bcrypt = require('bcrypt');
const joi = require('joi')
const complexity = require('joi-password-complexity')

const User = require('../models/User')
const authenticateToken = require('../middleware/authorized')


/*

  APIs:

  authenticate - ok
  get_account - ok
  edit_account - fix
  delete_account - change to delete
  add_review - 
  edit_review -
  delete_review -
  add_favourite -
  delete_favourite -

*/


// authenticate
router.post('/authenticate', async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username"),
      password: complexity().required().label("Password"),
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
    console.log("Authentication successful")
  }
  catch (error) {
    console.error("Error while authenticating user account")
    res.status(500).send({ message: "Internal Server Error" })
  }
})


// get account data
router.post('/get_account', authenticateToken, async (req, res) => {
  try {
    // get user by username and skip password
    const user = await User.findById(req.user._id).select('-password');
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // send user data
    res.status(200).json(user);
    console.log("User account data recieved successfully")
  }
  catch (error) {
    console.error("Error while reading user data")
    res.status(500).send({ message: "Internal Server Error" });
  }
})

// fix it
// update account data
router.post('/edit_account', authenticateToken, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required.label("Username"),
      firstName: joi.string().label("First Name"),
      lastName: joi.string().label("Last Name"),
      email: joi.email().label("Email"),
      password: complexity().label("Password")
    }).validate(req.body);

    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // get current user data
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // check if username is being changed and if it's already taken
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({
        username: req.body.username,
        _id: { $ne: req.user._id }
      });

      if (usernameExists) {
        return res.status(400).json({ message: "Username is already taken." });
      }
      user.username = req.body.username;
    }

    // check if email is being changed and if it's already taken
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email,
        _id: { $ne: req.user._id } // exclude current user
      });

      if (emailExists) {
        return res.status(400).json({ message: "Email is already in use." });
      }
      user.email = req.body.email;
    }

    // update other fields
    if (req.body.firstName)
      user.firstName = req.body.firstName;

    if (req.body.lastName)
      user.lastName = req.body.lastName;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    // save updated user
    await user.save();

    // send user data
    const updatedUser = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      message: "Account updated successfully",
      user: updatedUser
    });
    console.log("User account update successful")
  }
  catch (error) {
    console.error("Error while updating user account")
    res.status(500).send({ message: "Internal Server Error" });
  }
})

// delete account
router.post('/delete_account', authenticateToken, async (req, res) => {
  try {
    // get user by username and skip password
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // delete user
    await user.deleteOne()

    // send info
    res.status(200).send({ message: "User deleted successfully" });
    console.log("User deleted successfully")
  }
  catch (error) {
    console.error("Error while deleting user")
    res.status(500).send({ message: "Internal Server Error" });
  }
})


// add review


// delete review


// edit review


// add to favourite


// remove from favourite


module.exports = router