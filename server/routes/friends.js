var express = require('express');
var router = express.Router();
const db = require('../config/db')

// GET ALL USERS EXCEPT USER HIMSELF
router.get('/allUsers', (req,res) => {
    const sql = "SELECT concat(name,' ', lastname) as name, public, iduser as idUser\n" +
        "FROM strava.user\n" +
        "WHERE iduser != ? AND iduser NOT IN (\n" +
        "SELECT idreceiver FROM strava.friends WHERE idsender = ?\n" +
        "UNION\n" +
        "SELECT idsender FROM strava.friends WHERE idreceiver = ?\n" +
        ")\n"

    db.query(sql, [req.user.id, req.user.id, req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})
        res.status(200).json(result)
    })
})

// GET ALL FRIENDSHIP REQUESTS FOR 1 USER
router.get('/requests', (req,res) => {
    const sql = "SELECT iduser as idUser, public, concat(name,' ', lastname) as name\n" +
        "FROM friends f\n" +
        "JOIN user u ON u.iduser = f.idsender\n" +
        "WHERE state = 'Pendente' and f.idreceiver = ?"

    db.query(sql, [req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json(result)
    })
})

router.get('/all', (req,res) => {
    const sql = "SELECT  concat(name,' ', lastname) as name, public, iduser as idUser \n" +
        "FROM strava.friends f\n" +
        "JOIN strava.user u ON u.iduser = f.idreceiver\n" +
        "WHERE idsender = ? AND state = 'Aceite' "

    db.query(sql, [req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json(result)
    })
})

// MAKE A FRIENDSHIP REQUEST
router.post('/make-request', (req,res) => {
    const sql = "INSERT INTO friends (idsender, idreceiver) VALUES (?, ?)"

    const {id_receiver} = req.body

    db.query(sql, [req.user.id, id_receiver], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        res.status(200).json({message:'Request made'})
    })
})

// ACCECPT FRIENDSHIP REQUEST
router.post('/accept-request', (req,res) => {
    const sqlUpdate = "UPDATE friends SET state = 'Aceite' WHERE (idsender = ?) and (idreceiver = ?)"

    const {id_receiver} = req.body
    // first update the old value on the database
    db.query(sqlUpdate, [id_receiver, req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        // insert the new friendship
        const sqlInsert = "INSERT INTO friends (idsender, idreceiver, state) VALUES (?, ?, ?)"
        db.query(sqlInsert, [req.user.id, id_receiver, 'Aceite'], (err,result) => {
            if (err) res.status(500).json({error:'Internal server error'})

            res.status(200).json({message:'Firendship accepeted'})
        })
    })
})

// REFUSE FRIENDSHIP REQUEST
router.post('/refuse-request', (req,res) => {
    const sqlUpdate = "UPDATE friends SET state = 'Recusado' WHERE (idsender = ?) and (idreceiver = ?)"

    const {id_receiver} = req.body
    // first update the old value on the database
    db.query(sqlUpdate, [id_receiver, req.user.id], (err,result) => {
        if (err) res.status(500).json({error:'Internal server error'})

        // insert the new friendship
        const sqlInsert = "INSERT INTO friends (idsender, idreceiver, state) VALUES (?, ?, ?)"
        db.query(sqlInsert, [req.user.id, id_receiver, 'Recusado'], (err,result) => {
            if (err) res.status(500).json({error:'Internal server error'})

            res.status(200).json({message:'Firendship refused'})
        })
    })
})


module.exports = router