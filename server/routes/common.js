const router = require('express').Router()
const bcrypt = require('bcrypt')
const joi = require('joi')
const complexity = require('joi-password-complexity')

const User = require('../models/User')
const Movie = require('../models/Movie')

/*

  APIs:

  register - ok
  get_all_movies - ok
  get_movie - ok

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


// get all movies
router.get('/get_all_movies', async (req, res) => {
  try {
    // find all movies
    const movies = await Movie.find({}).select('-__v -createdAt -reviews');
    if (!movies)
      return res.status(404).json({ message: "No movies found" });

    // send movies
    res.status(200).json(movies);
    console.log("Movies fetched successfully")

  }
  catch (error) {
    console.error("Error fetching movies:", error)
    res.status(500).json({ message: "Failed to fetch movies" })
  }
})

// get movie by title
router.get('/get_movie/:title', async (req, res) => {
  try {
    // find movie by title
    const movie = await Movie.findOne({ title: req.params.title }).select('-__v -createdAt');
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });

    // send movie
    res.status(200).json(movie);
    console.log("Movie fetched successfully")

  }
  catch (error) {
    console.error("Error fetching movie:", error)
    res.status(500).json({ message: "Failed to fetch movie" })
  }
});


module.exports = router