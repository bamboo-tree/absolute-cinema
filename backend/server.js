require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const commonRoutes = require('./routes/common')


app.use(express.json())
app.use(cors())

// my routes
app.use("/api/common", commonRoutes)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server listening on PORT: ${port}`))