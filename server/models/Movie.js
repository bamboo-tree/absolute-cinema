const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  year: {type: Date, required: false},
  directory: {type: [String], required: true},
  cast: {type: [String], required: true},
  awards: {type: [String], required: false},
  thumbnailPath: {type: String, required: false} // thumbnails are stored on "server side" in direcotry with uniqe UUID paths
})

const Movie = mongoose.model("Movie", movieSchema)

module.exports = { Movie }
