const jwt = require('jsonwebtoken')
const db = require('../config/db')

const JWT_SECRET = process.env.JWT_SECRET

function isLogged(req,res,next) {
    const token = req.headers.authorization

    // user not logged in
    if (!token) return res.status(401).json({message: 'Don\'t have access. Log in first'})

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET)
        req.user = decoded
        return next()
    }
    catch (err){
        res.status(401).json({message:'Invalid token'})
    }
}

function profilePermisson(req,res,next) {
    const sql = "SELECT iduser as idUser, public FROM strava.user \n" +
        "WHERE iduser = ?"
    db.query(sql, [req.params.id], (err,result) => {
        if (err) return res.status(500).json({'error': 'Internal server error'})

        if (result.length === 1){
            // profile found
            const userProfile = result[0]
            // public profile or the user himself
            if (userProfile.public || userProfile.idUser === req.user.id) return next()

            const sqlFriends = "SELECT * FROM strava.friends\n" +
                "WHERE idsender = ? AND idreceiver = ? AND state = 'Aceite'"
            db.query(sqlFriends, [req.user.id, userProfile.idUser], (err,result) => {
                if (err) return res.status(500).json({'error': 'Internal server error'})

                // users aren't friends
                if (!result.length) return res.status(403).json({
                    message: 'This is a private profile. You don\'t have access.'
                })
                else{
                    return next()
                }
            })
        }
        else return res.status(404).json({
            message: 'Profile not found'
        })

    })
}

module.exports = {
    isLogged,
    profilePermisson
}