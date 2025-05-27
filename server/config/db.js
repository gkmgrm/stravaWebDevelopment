const mysql = require('mysql2')

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "strava"
})

con.connect(function(err) {
    if (err) throw err;
})


module.exports = con