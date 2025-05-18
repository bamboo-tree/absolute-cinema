const router = require('express').Router()
const bcrypt = require('bcrypt');
const joi = require('joi')
const complexity = require('joi-password-complexity')

const User = require('../models/User')
const Movie = require('../models/Movie')
const authenticateToken = require('../middleware/authorized')


/*

  APIs:

  add_movie -
  edit_movie -
  delete_movie -
  delete_user -
  delete_review -

*/


// add movie
router.post('/add_movie', authenticateToken, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title"),
      description: joi.string().required.label("Description"),
      directors: joi.array().required().label("Directors"),
      cast: joi.array().required().label("Cast"),
      date: joi.date().label("Date"),
      thumbnail: joi.string().required().label("Thumbnail"),
      images: joi.array().label("Images")
    }).validate(req.body)

    if (error)
      return res.status(400).send({ message: error.details[0].message })

    // check if movie with this title already exists
    const movie = await Movie.findOne({ title: req.body.title })
    if (movie) {
      return res.status(400).json({ message: "Movie with this title already exists." })
    }

    // save movie
    await new Movie({ ...req.body }).save()
    res.status(201).send({ message: "Movie added successfully" })
    console.log("Movie added successfully")
  }
  catch {
    console.error("Error while adding new movie")
    res.status(500).send({ message: "Internal Server Error" })
  }
})


// edit movie


// delete movie


// delete user


// delete review




module.exports = router