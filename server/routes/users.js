var express = require('express');
var router = express.Router();
const db = require('../config/db')

// GET PROFILE POSTS BY USER ID
router.get('/profile/:id', (req,res) => {
    const sql = "SELECT idpost as idPost, description, datetime as 'dataPost', p.public AS publicPost, iduser as 'idUser', concat(name,' ', lastname) as name, u.public AS publicProfile\n" +
        "FROM posts p\n" +
        "JOIN user u ON u.iduser = p.idautor\n" +
        "WHERE idautor = ? ORDER BY datetime DESC"

    db.query(sql, [req.params.id], (err,result) => {
        if (err) res.status(500).json({error: 'Internal server error'})

        res.status(200).json(result)
    })
})

// GET CRONOLOGIA POSTS BY USERS ID
router.get('/cronologia', (req,res) => {
    const sqlFriends = "SELECT p.idpost AS idPost,concat(u2.name,' ', u2.lastname) as name, u2.iduser as idUser, p.description, p.datetime AS 'dataPost'\n" +
        "FROM friends a\n" +
        "JOIN user u ON u.iduser = a.idsender\n" +
        "JOIN user u2 ON u2.iduser = a.idreceiver\n" +
        "JOIN posts p ON p.idautor = u2.iduser\n" +
        "WHERE a.state='Aceite' AND u.iduser = ? ORDER BY p.datetime DESC"

    db.query(sqlFriends, [req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json(result)
    })
})

// GET USERS HIMSELF
router.get('/me', (req,res) => {
    const sql = "SELECT iduser, concat(name, ' ', lastname) as 'name', email, public\n" +
        "FROM strava.user WHERE iduser = ?\n"
    db.query(sql, [req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json(result[0])
    })
})


module.exports = router;
