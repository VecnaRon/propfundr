// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',   // your MySQL host
  user: 'root',        // your MySQL user
  password: 'rko16522',        // your MySQL password
  database: 'propfundr', // your database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err.stack);
  } else {
    console.log('Connected to the database.');
  }
});

module.exports = db;
