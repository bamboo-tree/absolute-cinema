require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const connection = require('./database')
const commonRoutes = require('./routes/common')

//middleware
app.use(express.json())
app.use(cors())

// routes
app.use('/api/common', commonRoutes)

// connection with database
connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is working on PORT: ${port}`))