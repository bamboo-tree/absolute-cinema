const mongoose = require('mongoose')


const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  directors: { type: [String], required: true },
  cast: { type: [String], required: true },
  date: { type: Date, required: false },
  thumbnail: { type: String, required: true },
  images: { type: [String], required: false }, // list of paths to images stored on server side
})


const Movie = mongoose.model("Movie", movieSchema)
module.exports = Movie