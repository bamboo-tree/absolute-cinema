const router = require('express').Router()
const bcrypt = require('bcrypt');
const joi = require('joi')
const complexity = require('joi-password-complexity')

const User = require('../models/User')
const Movie = require('../models/Movie')
const { authenticateToken, authorizeUser, authorizeBoth } = require('../middleware/authorized')


/*

  APIs:

  authenticate - ok
  get_account - ok
  update_account - ok
  delete_account - ok
  add_review - ok
  update_review - ok
  delete_review - ok

*/


// login
router.post('/login', async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username"),
      password: complexity().required().label("Password"),
    }).validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message })

    // find user by username
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser)
      return res.status(401).json({ message: "Invalid Email or Password" })

    // check password
    const validPassword = await bcrypt.compare(
      req.body.password,
      existingUser.password
    )
    if (!validPassword)
      return res.status(401).json({ message: "Invalid Email or Password" })

    // create new token for user
    const token = existingUser.generateAuthToken();
    res.status(200).json({ token: token, message: "Logged in successfully" })
  }
  catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
})


// get account data
router.get('/get_account', authenticateToken, authorizeBoth, async (req, res) => {
  try {
    // get user by id and skip password
    const user = await User.findById(req.user._id).select('-password -__v');
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // send user data
    res.status(200).json(user);
  }
  catch (error) {
    console.error("Error while reading user data")
    res.status(500).json({ message: "Internal Server Error" });
  }
})


// update account data
router.put('/update_account', authenticateToken, authorizeBoth, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().label("Username"),
      firstName: joi.string().label("First Name"),
      lastName: joi.string().label("Last Name"),
      email: joi.string().email().label("Email"),
      password: complexity().label("Password")
    }).validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message })

    // get current user data
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // update object
    const updates = {};
    const errors = [];

    // check and update username
    if (req.body.username && req.body.username !== user.username) {
      const usernameExists = await User.findOne({
        username: req.body.username,
        _id: { $ne: user._id }
      });

      if (usernameExists) {
        errors.push("Username is already taken");
      } else {
        updates.username = req.body.username;
      }
    }

    // check and update email
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({
        email: req.body.email,
        _id: { $ne: user._id }
      });

      if (emailExists) {
        errors.push("Email is already in use");
      } else {
        updates.email = req.body.email;
      }
    }

    // if any conflicts, return errors
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Update failed",
        errors
      });
    }

    // update other fields if provided
    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;

    // update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(Number(process.env.SALT));
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    // apply updates
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    // generate new token if username or email changed
    let newToken;
    if (updates.username || updates.email) {
      newToken = updatedUser.generateAuthToken();
    }

    res.status(200).json({
      message: "User account updated successfully",
      user: updatedUser,
      token: newToken || undefined
    });

    console.log("User account update successful")
  }
  catch (error) {
    console.error("Error while updating user account")
    res.status(500).json({ message: "Internal Server Error" });
  }
})


// delete account
router.delete('/delete_account', authenticateToken, authorizeBoth, async (req, res) => {
  try {
    // get user by username and skip password
    const user = await User.findById(req.user._id);
    if (!user)
      return res.status(404).json({ message: "User not found." });

    // delete user
    await user.deleteOne()

    // send info
    res.status(200).json({ message: "User deleted successfully" });
    console.log("User deleted successfully")
  }
  catch (error) {
    console.error("Error while deleting user")
    res.status(500).json({ message: "Internal Server Error" });
  }
})

// add review
router.post('/add_review', authenticateToken, authorizeUser, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title"),
      rating: joi.number().min(1).max(10).required().label("Rating"),
      comment: joi.string().required().label("Comment")
    }).validate(req.body);

    if (error) {
      console.error("Validation error:", error.details);
      return res.status(400).json({ message: error.details[0].message });
    }

    // find movie by title
    const movie = await Movie.findOne({ title: req.body.title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    // have user already reviewed this movie?
    const existingReview = movie.reviews.find(review => review.user.equals(req.user._id));
    if (existingReview) {
      return res.status(409).json({ message: "You have already reviewed this movie." });
    }

    // create new review object
    const newReview = {
      user: req.user._id,
      username: req.user.username,
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date()
    };

    // add review to movie and save
    movie.reviews.push(newReview);
    await movie.save();

    res.status(201).json({
      message: "Review added successfully",
      review: newReview
    });
    console.log(`Review added to movie: ${movie.title}`);

  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({
      message: "Failed to add review",
      error: error.message
    });
  }
});


// delete review
router.delete('/delete_review', authenticateToken, authorizeUser, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title")
    }).validate(req.body);

    if (error) {
      console.error("Validation error:", error.details);
      return res.status(400).json({ message: error.details[0].message });
    }

    // find movie by title
    const movie = await Movie.findOne({ title: req.body.title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    // find index of review by user id
    const reviewIndex = movie.reviews.findIndex(review => review.user.equals(req.user._id));
    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // remove review by index
    movie.reviews.splice(reviewIndex, 1);
    await movie.save();

    res.status(200).json({ message: "Review deleted successfully" });
    console.log(`Review deleted from movie: ${movie.title}`);

  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message
    });
  }
});



// update review
router.put('/update_review', authenticateToken, authorizeUser, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title"),
      rating: joi.number().min(1).max(10).label("Rating"),
      comment: joi.string().label("Comment")
    }).validate(req.body);

    if (error) {
      console.error("Validation error:", error.details);
      return res.status(400).json({ message: error.details[0].message });
    }

    // find movie by title
    const movie = await Movie.findOne({ title: req.body.title });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    // find review by user id
    const review = movie.reviews.find(review => review.user.equals(req.user._id));
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    // update review fields if provided
    if (req.body.rating) {
      review.rating = req.body.rating;
    }
    if (req.body.comment) {
      review.comment = req.body.comment;
    }
    if (!req.body.rating && !req.body.comment) {
      return res.status(400).json({ message: "No fields to update." });
    }
    // save updated movie
    await movie.save();

    res.status(200).json({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      message: "Failed to update review",
      error: error.message
    });
  }
});


module.exports = router