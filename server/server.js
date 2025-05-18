require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const connection = require('./database')
const testRoute = require('./routes/test')
const commonRoute = require('./routes/common')
const authorizedRoute = require('./routes/authorized')
// const sudoRoute = require('./routes/sudo')

//middleware
app.use(express.json())
app.use(cors())

// routes
app.use('/api/test', testRoute)
app.use('/api/common', commonRoute)
app.use('/api/authorized', authorizedRoute)
// app.use('/api/sudo', sudoRoute)

// connection with database
connection()

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`Server is working on PORT: ${port}`))