const router = require('express').Router()
const bcrypt = require('bcrypt');
const joi = require('joi')
const complexity = require('joi-password-complexity')
const upload = require('../config/multer')
const fs = require('fs')
const path = require('path')

const User = require('../models/User')
const Movie = require('../models/Movie')
const authenticateToken = require('../middleware/authorized')


/*

  APIs:

  add_movie -
  edit_movie -
  delete_movie -
  delete_user -
  delete_review -H

*/


// add movie
router.post('/add_movie', authenticateToken, upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "gallery", maxCount: 5 }]), async (req, res) => {
  try {
    // convert string to array for directors and cast
    const processNames = (input) => {
      if (Array.isArray(input)) return input;
      if (typeof input === 'string') {
        return input.split(',').map(name => name.trim());
      }
      return [];
    };

    const { title, description, directors, cast, releaseDate } = req.body

    // validate input
    if (!title || !description || !directors || !cast || !releaseDate) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // check if movie exists
    const movie = await Movie.findOne({ title })
    if (movie) {
      // cleanup uploaded files if movie exists
      if (req.files) {
        Object.values(req.files).forEach(files => {
          files.forEach(file => fs.unlinkSync(file.path))
        })
      }
      return res.status(400).send({ message: "Movie already exists" })
    }

    // Prepare paths
    const thumbnailPath = req.files['thumbnail']?.[0]?.filename || null
    const galleryPaths = req.files['gallery']?.map(file => file.filename) || []

    if (!thumbnailPath)
      return res.status(400).json({ message: "Thumbnail is required" })

    // create and save new movie
    const newMovie = new Movie({
      title,
      description,
      directors: processNames(directors),
      cast: processNames(cast),
      releaseDate,
      thumbnail: `/uploads/movies/${thumbnailPath}`,
      gallery: galleryPaths.map(filename => `/uploads/movies/${filename}`)
    })
    await newMovie.save()

    res.status(201).json({ message: "Movie added successfully" })
    console.log("Movie added successfully")
  }
  catch (error) {

    console.error("Error while adding new movie")
    res.status(500).json({ message: "Internal server error" })

    // cleanup files on error
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path)
          }
        })
      })
    }
  }
})


// edit movie


// delete movie


// delete user


// delete review




module.exports = router