const jwt = require('jsonwebtoken')

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

module.exports = {
    isLogged
}