const express = require('express')
const connection = require('./db')
const cors = require('cors')
const app = express()
require('dotenv').config()
const authRoutes = require('./routes/auth')


app.use(express.json())
app.use(cors())

// my routes
app.use("/api/auth", authRoutes);

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Nasłuchiwanie na porcie ${port}`))

connection()