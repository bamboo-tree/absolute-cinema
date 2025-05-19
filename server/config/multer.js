const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/movies')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // size in MB
})

module.exports = upload