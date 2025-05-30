const router = require('express').Router()
const joi = require('joi')
const upload = require('../config/multer')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')

const User = require('../models/User')
const Movie = require('../models/Movie')
const { authenticateToken, authorizeAdmin } = require('../middleware/authorized')


/*

  APIs:

  add_movie - ok
  update_movie - ok
  delete_movie - ok
  delete_user - ok
  delete_review - ok

*/


// add movie
router.post('/add_movie', authenticateToken, authorizeAdmin, upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "gallery", maxCount: 10 }]), async (req, res) => {
  try {
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
      return res.status(400).json({ message: "Movie already exists" })
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
      gallery: galleryPaths.map(filename => `/uploads/movies/${filename}`),
      reviews: []
    })
    await newMovie.save()

    res.status(201).json({ message: "Movie added successfully" })
    console.log("Movie added successfully")
  }
  catch (error) {
    console.error("Error while adding new movie")

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

    res.status(500).json({ message: "Internal server error" })
  }
})


// update movie
router.put('/update_movie/:id', authenticateToken, authorizeAdmin, upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'gallery', maxCount: 10 }]), async (req, res) => {
  try {
    const { id } = req.params;

    // validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid movie ID format" });
    }

    // find movie to update
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const updateData = { ...req.body };

    // directors
    if (req.body.directors) {
      updateData.directors = processNames(req.body.directors);
    }

    // cast
    if (req.body.cast) {
      updateData.cast = processNames(req.body.cast);
    }

    // thumbnail
    if (req.files?.thumbnail) {
      if (movie.thumbnail) {
        const oldThumbPath = path.join(__dirname, '../public', movie.thumbnail);
        if (fs.existsSync(oldThumbPath)) fs.unlinkSync(oldThumbPath);
      }
      updateData.thumbnail = `/uploads/movies/${req.files.thumbnail[0].filename}`;
    }

    // gallery
    let updatedGallery = [...movie.gallery];

    // remove old images from gallery
    if (req.body.removeGallery) {
      const filesToRemove = JSON.parse(req.body.removeGallery);

      filesToRemove.forEach(filename => {
        const index = updatedGallery.indexOf(filename);
        if (index !== -1) {
          const filePath = path.join(__dirname, '../public', updatedGallery[index]);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          updatedGallery.splice(index, 1);
        }
      });
    }

    // add new images to gallery
    if (req.files?.gallery) {
      const newImages = req.files.gallery.map(file => `/uploads/movies/${file.filename}`);
      updatedGallery = [...updatedGallery, ...newImages];
    }
    // update gallery in updateData
    updateData.gallery = updatedGallery;

    // update movie data
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.status(200).json({ message: "Movie updated successfully", movie: updatedMovie });
    console.log("Movie updated successfully")
  }
  catch (error) {
    console.error("Error while updating movie:", error);

    // delete files
    if (req.files) {
      Object.values(req.files).forEach(files => {
        files.forEach(file => {
          try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          } catch (err) {
            console.error("Error deleting file:", err);
          }
        });
      });
    }

    res.status(500).json({
      message: "Failed to update movie",
      error: error.message
    });
  }
})

// delete movie
router.delete('/delete_movie', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title")
    }).validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // find movie
    const movie = await Movie.findOneAndDelete({ title: req.body.title });
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });

    // delete files related with movie
    const deleteFile = (filePath) => {
      if (!filePath) return;

      const fullPath = path.join(__dirname, '../public', filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };

    deleteFile(movie.thumbnail);
    movie.gallery.forEach(deleteFile);

    // send message
    res.status(200).json({ message: "Movie deleted successfully" });
    console.log("Movie deleted successfully")

  }
  catch (error) {
    console.error("Error deleting movie:", error);

    // if error occured while deleting a movie but before removing files, idk...
    if (movie) {
      await Movie.create(movie).catch(() => { });
    }

    res.status(500).json({ message: "Failed to delete movie" });
  }
});


// get all users
router.get('/get_all_users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // find all users
    const users = await User.find({}).select('-__v -password');
    if (!users)
      return res.status(404).json({ message: "No users found" });

    // send users
    res.status(200).json({ users: users, message: "Users fetched successfully" });
    console.log("Users fetched successfully")
  }
  catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Failed to fetch users" })
  }
})

// delete user
router.delete('/delete_user', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      username: joi.string().required().label("Username")
    }).validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // find user
    const user = await User.findOneAndDelete({ username: req.body.username });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // send message
    res.status(200).json({ message: "User deleted successfully" });
    console.log("User deleted successfully")
  }
  catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Failed to delete user" })
  }
})


// delete review
router.delete('/delete_review', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // validate body
    const { error } = joi.object({
      title: joi.string().required().label("Title"),
      username: joi.string().required().label("Username")
    }).validate(req.body);

    if (error)
      return res.status(400).json({ message: error.details[0].message });

    // find movie
    const movie = await Movie.findOne({ title: req.body.title });
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });

    // find user
    const user = await User.findOne({ username: req.body.username });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // find review by user id
    const reviewIndex = movie.reviews.findIndex(review => review.user.equals(user._id));
    if (reviewIndex === -1)
      return res.status(404).json({ message: "Review not found" });

    // remove review from movie and save
    movie.reviews.splice(reviewIndex, 1);
    await movie.save();

    // send message
    res.status(200).json({ message: "Review deleted successfully" });
    console.log("Review deleted successfully")
  }
  catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({ message: "Failed to delete review" })
  }
})


// convert string into array
function processNames(input) {
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    return input.split(',').map(name => name.trim());
  }
  return [];
}


module.exports = router