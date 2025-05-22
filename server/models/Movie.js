const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  directors: {
    type: [String],
    required: true
  },
  cast: {
    type: [String],
    required: true
  },
  releaseDate: {
    type: Date,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  gallery: {
    type: [String],
    default: []
  },
  reviews:
    [reviewSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
})


// add indexes?

const Movie = mongoose.model("Movie", movieSchema)
module.exports = Movie