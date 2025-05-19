const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  directors: { type: [String], required: true },
  cast: { type: [String], required: true },
  releaseDate: { type: Date, required: true },
  thumbnail: { type: String, required: true },
  gallery: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
})

const Movie = mongoose.model("Movie", movieSchema)
module.exports = Movie