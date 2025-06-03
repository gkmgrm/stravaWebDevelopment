var express = require('express');
var router = express.Router();
const db = require('../config/db')
const  {profilePermisson} = require('../middleware/auth')

// GET PROFILE POSTS BY USER ID
router.get('/profile/:id', profilePermisson, (req,res) => {
    const sql = "SELECT idpost as idPost, description, datetime as 'dataPost', p.public AS publicPost, iduser as 'idUser', \n" +
        "concat(name,' ', lastname) as name,\n" +
        "(SELECT COUNT(*) FROM strava.likepost lp WHERE lp.idpost = p.idpost) as 'likesCount',\n" +
        "(SELECT COUNT(*) FROM strava.comments c WHERE c.idpost = p.idpost) as 'commentsCount'\n" +
        "FROM strava.posts p\n" +
        "JOIN strava.user u ON u.iduser = p.idautor\n" +
        "WHERE idautor = ?\n" +
        "ORDER BY datetime DESC"

    db.query(sql, [req.params.id], (err,result) => {
        if (err) res.status(500).json({error: 'Internal server error'})

        res.status(200).json(result)
    })
})

// GET CRONOLOGIA POSTS BY USERS ID
router.get('/cronologia', (req,res) => {
    const sqlFriends = "(\n" +
        "SELECT p.idpost AS idPost, p.description, p.datetime AS 'dataPost', p.public AS publicPost,\n" +
        "u2.iduser as idUser, concat(u2.name,' ', u2.lastname) as name,\n" +
        "(SELECT COUNT(*) FROM strava.likepost lp WHERE lp.idpost = p.idpost) as 'likesCount',\n" +
        "(SELECT COUNT(*) FROM strava.comments c WHERE c.idpost = p.idpost) as 'commentsCount'\n" +
        "FROM strava.friends a\n" +
        "JOIN strava.user u ON u.iduser = a.idsender\n" +
        "JOIN strava.user u2 ON u2.iduser = a.idreceiver\n" +
        "JOIN strava.posts p ON p.idautor = u2.iduser\n" +
        "WHERE a.state='Aceite' AND u.iduser = ?\n" +
        ")\n" +
        "UNION\n" +
        "(\n" +
        "SELECT p.idpost AS idPost, p.description, p.datetime AS 'dataPost', p.public AS publicPost,\n" +
        "u2.iduser as idUser, concat(u2.name,' ', u2.lastname) as name,\n" +
        "(SELECT COUNT(*) FROM strava.likepost lp WHERE lp.idpost = p.idpost) as 'likesCount',\n" +
        "(SELECT COUNT(*) FROM strava.comments c WHERE c.idpost = p.idpost) as 'commentsCount'\n" +
        "FROM strava.posts p \n" +
        "JOIN strava.user u2 ON u2.iduser = p.idautor\n" +
        "WHERE p.public = 1 AND u2.iduser != ?\n" +
        ")\n" +
        "ORDER BY dataPost DESC"

    db.query(sqlFriends, [req.user.id, req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json(result)
    })
})

// GET USER HIMSELF
router.get('/me', (req,res) => {
    const sql = "SELECT iduser as idUser, concat(name, ' ', lastname) as 'name', email, public as 'publicProfile'\n" +
        "FROM strava.user WHERE iduser = ?"
    db.query(sql, [req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        const user = result[0]

        const sqlArrayLikes = "SELECT idpost FROM strava.likepost\n" +
            "WHERE iduser = ?"
        db.query(sqlArrayLikes, [req.user.id], (err,result) => {
            if (err) res.status(500).json({error:'Internal server error'})


            res.status(200).json({
                user: user,
                arrayLikes: result.map(r => r.idpost)
            })
        })
    })
})


module.exports = router;
