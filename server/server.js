require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const {isLogged} = require('./middleware/auth')

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:5173',
    exposedHeaders: ['Authorization'],
}))

// ROUTES
const userRoutes = require('./routes/users')
app.use('/api/users', isLogged, userRoutes)
const friendsRoutes = require('./routes/friends')
app.use('/api/friends', isLogged, friendsRoutes)
const authRoutes = require('./routes/auth')
app.use('/api', authRoutes)
const postRoutes = require('./routes/posts')
app.use('/api/posts', isLogged, postRoutes)


app.listen(process.env.PORT, () => console.log('running'))
