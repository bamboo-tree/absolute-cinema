require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const path = require('path')

const connection = require('./config/database')
const commonRoute = require('./routes/common')
const authorizedRoute = require('./routes/authorized')
const sudoRoute = require('./routes/sudo')

//middleware
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// routes
app.use('/api/common', commonRoute)
app.use('/api/authorized', authorizedRoute)
app.use('/api/sudo', sudoRoute)

// connection with database
connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is working on PORT: ${port}`))