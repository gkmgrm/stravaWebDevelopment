var express = require('express');
var router = express.Router();
const db = require('../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

// LOGIN
router.post('/login', (req,res) => {
    const {email, password} = req.body

    const sql = "SELECT * FROM user WHERE email = ?"
    db.query(sql, [email], async (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        const user = result[0]
        // user does not exist
        if (!user)
            return res.status(404).json({message:'User not found'})

        const match = await bcrypt.compare(password, user.password)
        if (!match){
            // wrong password
            return res.status(401).json({message:'Wrong password/user combination'})
        }

        const token = jwt.sign({
            id: user.iduser,
            email: user.email,
            name: user.name,
            profile_public: user.public
        }, JWT_SECRET, {expiresIn: "30m"})

        res.header('Authorization', token)
        return res.status(200).json({message:'User logged in'})
    })
    
})

// REGISTER NEW USERS
router.post('/sign-up', async (req,res) => {
    const {email, password, name, lastname, birthdate, gender, public} = req.body

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const sql = "INSERT INTO user (name, lastname, birthdate, gender, email, password, public) VALUES (?, ?, ?, ?, ?, ?, ?)"
    db.query(sql, [name, lastname, birthdate, gender, email, hashedPassword, public], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(201).json({
            message:'User created'
        })
    })
})

module.exports = router