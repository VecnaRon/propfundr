import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js'; // Ensure correct import

// Register User
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone_number, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)",
      [full_name, email, hashedPassword, phone_number, role]
    );

    if (result.affectedRows === 1) {
      return res.status(201).json({ message: "User registered successfully" });
    } else {
      return res.status(500).json({ error: "User registration failed" });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [results] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Owner Wallet
export const getOwnerWallet = async (req, res) => {
  try {
    const ownerId = req.user.id; // Ensure this comes from the logged-in owner

    const [rows] = await pool.query(
      `SELECT 
          SUM(i.amount) AS total_earnings,
          SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS pending_funds,
          SUM(CASE WHEN i.status = 'approved' THEN i.amount ELSE 0 END) AS withdrawable_funds
      FROM investments i
      JOIN projects p ON i.project_id = p.id
      WHERE p.owner_id = ?`,
      [ownerId]
    );

    const walletData = rows[0] || {}; // Ensure we get an object even if empty

    res.json({
      totalEarnings: parseFloat(walletData.total_earnings) || 0.0,
      pendingFunds: parseFloat(walletData.pending_funds) || 0.0,
      withdrawableFunds: parseFloat(walletData.withdrawable_funds) || 0.0,
    });
  } catch (error) {
    console.error("Error fetching owner wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
