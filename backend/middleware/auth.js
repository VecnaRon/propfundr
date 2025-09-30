import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const authenticateJWT = async (req, res, next) => {
  console.log('Request Headers:', req.headers); // 🔥
  console.log('Cookies:', req.cookies);         // 🔥

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Token not found in Authorization header'); // 🔥
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded User from Token:', decoded); // 🔥

    // Check token_version from DB
    const [rows] = await pool.query('SELECT token_version FROM users WHERE id = ?', [decoded.id]);

    if (!rows.length) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const currentTokenVersion = rows[0].token_version;

    if (decoded.token_version !== currentTokenVersion) {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    req.user = decoded;
    next();

  } catch (err) {
    console.error('JWT Verification Error:', err);
    return res.status(403).json({ message: 'Forbidden: Invalid or expired token', error: err.message });
  }
};

export default authenticateJWT;
