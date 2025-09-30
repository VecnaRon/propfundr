import mysql from 'mysql2/promise'; // Use the promise-based version

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rko16522',
  database: process.env.DB_NAME || 'propfundr',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool; // Export the pool as default


