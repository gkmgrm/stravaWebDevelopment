var express = require('express');
var router = express.Router();
const db = require('../config/db')

// CREATE POST
router.post('/create', (req,res) => {
    const {description, public} = req.body

    const sql = "INSERT INTO posts (idautor, description, public) VALUES (?, ?, ?)"
    db.query(sql, [req.user.id, description, public], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(201).json({
            message:'Post created',
            idPost: result.insertId
        })
    })
})

// LIKE A POST
router.post('/:id/like', (req,res) => {
    const sql = "INSERT INTO likepost (iduser, idpost) VALUES (?, ?)"
    db.query(sql, [req.user.id, req.params.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json({message:'Posts liked'})
    })

})

// DELETE LIKE ON A POST
router.delete('/:id/unlike', (req,res) => {
    const sql = "DELETE FROM likepost WHERE (iduser = ?) and (idpost =?)"
    db.query(sql, [req.user.id, req.params.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json({message:'Posts disliked'})
    })

})

// INSERT COMMENT ON A POST
router.post('/:id/create-comment', (req,res) => {
    const {comment} = req.body

    const sql = "INSERT INTO comments (idpost, iduser, comment) VALUES (?, ?, ?)"
    db.query(sql, [req.params.id, req.user.id, comment], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(201).json({
            message:'Comment added',
            idComment: result.insertId
        })
    })
})

module.exports = router