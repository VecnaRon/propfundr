import mysql from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import authenticateJWT from './middleware/auth.js'; // Import JWT middleware
import bodyParser from "body-parser";
import fs from 'fs';
import path from 'path';
import PDFDocument from "pdfkit";
import walletRoutes from "./routes/authRoutes.js";
import nodemailer from "nodemailer";
import cron from "node-cron";
import axios from 'axios';
import express from "express";
import http from "http";
import { Server } from "socket.io";
import multer from 'multer'; 
import crypto from 'crypto';
import { fileURLToPath } from 'url'; // Use ES module import instead of require
import authRoutes from './routes/authRoutes.js';
import { getPayPalAccessToken, sendPayPalPayout } from "./paypalHelper.js";
import { sendEmail } from "./utils/email.js";
import { addNotification } from "./utils/notifications.js";
import dayjs from 'dayjs';
import cookieParser from 'cookie-parser';


// Initialize Express app
const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // ✅ frontend origin only
  credentials: true,              // ✅ allow cookies
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Adjust if using a different port for frontend
    methods: ["GET", "POST"],
  },
});

// Simple route to verify server is running
app.get("/", (req, res) => {
  res.send("Socket.IO server is running.");
});

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("register", async (userId) => {
    connectedUsers.set(userId, socket);
  
    try {
      await pool.query(
        'UPDATE users SET is_online = 1, status = "active", last_active = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (err) {
      console.error('Error updating online status:', err.message);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
  
    for (let [userId, value] of connectedUsers.entries()) {
      if (value === socket) {
        connectedUsers.delete(userId);
  
        // 👇 Update DB here
        try {
          await pool.query(
            'UPDATE users SET is_online = 0, status = "inactive", last_active = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
          );
          console.log(`User ${userId} marked offline in DB`);
        } catch (err) {
          console.error('Error marking user offline on disconnect:', err.message);
        }
      }
    }
  });
  
});

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Now you can use __dirname in the path for static file serving
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.use(express.json());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/api/wallet", walletRoutes);


// ✅ Create a promise-based pool
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();

// ✅ Test database connection
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to Railway MySQL database via pool.");
    conn.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

export default pool;

// Set the port
const PORT = process.env.PORT || 5000;

// Handle __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Make sure this is before app.use()


app.use('/exports', express.static(path.join(__dirname, 'exports')));


// Put this near the top of server.js after your DB pool is initialized
async function logAccess(userId, ip, action) {
  try {
    const timestamp = new Date().toLocaleString();  // Define the timestamp variable
    const logDetails = `[${timestamp}] ${action}`;  // Use the timestamp in the logDetails

    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, log_details) VALUES (?, ?, ?)',
      [userId, ip, logDetails]  // Use logDetails here
    );
  } catch (err) {
    console.error('Logging access failed:', err);
  }
}

///// Register

// Configured nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use any other email service
  auth: {
    user: process.env.EMAIL_USER, // Use the email from the .env
    pass: process.env.EMAIL_PASS  // Use the password from the .env
  }
});

app.post('/register', async (req, res) => {
  console.log("Received body:", req.body);
  try {
    const { 
      email, 
      password, 
      full_name, 
      role, 
      country, 
      state_or_region, 
      city, 
      address, 
      dob,
      phone_number // <- new required field
    } = req.body;
    
      
    if (!email || !password || !full_name || !role || !country || !state_or_region || !city || !address || !dob || !phone_number) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = crypto.randomInt(100000, 999999).toString();

    const [result] = await pool.query(
      `INSERT INTO users 
      (full_name, email, password, phone_number, role, country, state_or_region, city, address, dob, otp, user_status, token_version) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, hashedPassword, phone_number, role, country, state_or_region, city, address, dob, otp, 'pending', 1]
    );

    const newUserId = result.insertId;

    // ✅ Generate token
    const tokenPayload = {
      id: newUserId,
      role,
      token_version: 1, // match with DB
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
//otp via email
const mailOptions = {
  from: `"PropFundr Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: '🔐 Your One-Time Password (OTP) for PropFundr Registration',
  html: `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="background-color: #27ae60; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome to PropFundr 🎉</h1>
      </div>
      <div style="padding: 30px 20px; color: #333;">
        <p style="font-size: 16px;">Hi there,</p>
        <p style="font-size: 16px;">To complete your account registration, please enter the OTP below:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #27ae60;">${otp}</div>
        <p style="font-size: 14px; color: #555;">This code is valid for a limited time and can only be used once.</p>
        <p style="font-size: 14px; color: #555;">For your safety, <strong>do not share this code</strong> with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Didn't request this? Just ignore this email or contact PropFundr support if you have concerns.</p>
      </div>
      <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </div>
    </div>
  `,
  text: `Hi there,\n\nYour OTP for PropFundr registration is: ${otp}\n\nThis code is valid for a limited time. Please do not share it with anyone.\n\nIf you did not request this, ignore this email or contact PropFundr support.\n\n- The PropFundr Team`
};

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
      console.log('OTP sent: ' + info.response);
    });

       // 🔔 Notify Admins about the new user registration
       const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');
       for (const admin of adminRows) {
         await insertNotification(admin.id, `New user registered: ${full_name} (${role})`, "Admin Alert");
   
         io.emit(`admin_notification_${admin.id}`, {
           message: `New user registered: ${full_name} (${role})`,
           type: "Admin Alert"
         });
       }

    // Respond with success, informing the user to check their email for OTP
    res.status(201).json({ message: 'User registered successfully. Please check your email for OTP.', 
      token, });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// OTP Confirmation Route
app.post('/api/confirm-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userRows.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = userRows[0];
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update user status and clear OTP
    await pool.query(
      'UPDATE users SET user_status = "confirmed", otp = NULL, status = ?, is_online = 1, last_active = CURRENT_TIMESTAMP WHERE email = ?',
      ['active', email]
    );

    // Generate token and refresh token
  const payload = {
  id: user.id,
  email: user.email,
  role: user.role,
  token_version: user.token_version, // ✅ IMPORTANT
};
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '30d' });

    res.status(200).json({
      message: 'OTP confirmed. You are now registered.',
      token,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        full_name: user.full_name || '',
      },
    });

  } catch (error) {
    console.error('Error during OTP confirmation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Email sending function
const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
  from: `"PropFundr Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: '🔐 Your One-Time Password (OTP) for PropFundr Access',
  html: `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="background-color: #27ae60; padding: 20px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">PropFundr Security Verification</h1>
      </div>
      <div style="padding: 30px 20px; color: #333;">
        <p style="font-size: 16px;">Hello 👋,</p>
        <p style="font-size: 16px;">Use the OTP below to securely access your PropFundr account:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #27ae60;">${otp}</div>
        <p style="font-size: 14px; color: #555;">The code is valid for a limited time and can only be used once.</p>
        <p style="font-size: 14px; color: #555;">For your protection, <strong>never share this code</strong> with anyone — not even PropFundr staff.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Didn't request this OTP? Contact PropFundr support immediately.</p>
      </div>
      <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </div>
    </div>
  `,
  text: `Hello,\n\nYour OTP to access your PropFundr account is: ${otp}\n\nThis code is valid for a limited time only. Do not share it with anyone.\n\nIf you did not request this, contact PropFundr support immediately.\n\n- The PropFundr Team`
};

  return transporter.sendMail(mailOptions);
};

// POST /api/resend-otp
app.post('/api/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Check if user exists
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in database
    await pool.query('UPDATE users SET otp = ? WHERE email = ?', [otp, email]);

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP has been resent to your email' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ message: 'Failed to resend OTP' });
  }
});

 
// Login route - generates token
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const now = new Date();
  const getClientIp = (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const ipAddress = getClientIp(req);

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      // Log failed login
      await pool.query(
        `INSERT INTO failed_logins (user_id, ip_address, failure_reason, attempts)
         VALUES (?, ?, ?, ?)`,
        [null, ipAddress, 'Email not found', 1]
      );

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Check existing failed attempts in last 10 mins
      const [failures] = await pool.query(
        `SELECT COUNT(*) AS fail_count FROM failed_logins
         WHERE user_id = ? AND failed_at > (NOW() - INTERVAL 10 MINUTE)`,
        [user.id]
      );

      const attempts = failures[0].fail_count + 1;

      await pool.query(
        `INSERT INTO failed_logins (user_id, ip_address, failure_reason, attempts)
         VALUES (?, ?, ?, ?)`,
        [user.id, ipAddress, 'Incorrect password', attempts]
      );

      // If more than 5 failed attempts, log as fraudulent
      if (attempts >= 5) {
        await pool.query(
          `INSERT INTO fraudulent_activities (user_id, ip_address, activity_type, notes)
           VALUES (?, ?, ?, ?)`,
          [user.id, ipAddress, 'Brute force attempt', 'More than 5 failed logins in 10 mins']
        );
      }

      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Successful login — Update user, log access
    await pool.query(
      'UPDATE users SET status = ?, is_online = 1, last_active = CURRENT_TIMESTAMP WHERE email = ?',
      ['active', email]
    );

    await pool.query(
      `INSERT INTO access_logs (user_id, log_details) VALUES (?, ?)`,
      [user.id, `User logged in from IP ${ipAddress}`]
    );

    const payload = {
  id: user.id,
  email: user.email,
  role: user.role,
  token_version: user.token_version  // ✅ Include this!
};

const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
const refreshToken = jwt.sign(payload, process.env.REFRESH_SECRET_KEY, { expiresIn: '30d' });

res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: false, // set to false for localhost during dev
  sameSite: 'Lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
    res.json({
      token,
      role: user.role,
      full_name: user.full_name
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Investor Profile Completion
app.post('/api/investor-profile', async (req, res) => {
  try {
    const { user_id, investment_goal, risk_profile, investment_experience } = req.body;

    if (!user_id || !investment_goal || !risk_profile || !investment_experience) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists and is an investor
    const [user] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "investor"', [user_id]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Invalid investor user' });
    }

    // Insert investor profile
    await pool.query(
      `INSERT INTO investor_profiles (user_id, investment_goal, risk_profile, investment_experience) 
      VALUES (?, ?, ?, ?)`,
      [user_id, investment_goal, risk_profile, investment_experience]
    );

    res.status(201).json({ message: 'Investor profile created successfully' });
  } catch (error) {
    console.error('Error during investor profile creation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//complete-owner-profile
app.post('/api/complete-owner-profile', authenticateJWT, async (req, res) => {
  const {
    experience_years,
    property_type,
    ownership_type,
    funding_goals,
    location_focus,
    bio
  } = req.body;

  const user_id = req.user?.id; // Extracted from JWT payload

  if (!user_id) {
    return res.status(400).json({ message: "Authenticated user ID is missing." });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO owner_profiles 
        (user_id, experience_years, property_type, ownership_type, funding_goals, location_focus, bio) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, experience_years, property_type, ownership_type, funding_goals, location_focus, bio]
    );

    res.status(201).json({ message: "Owner profile created successfully!" });
  } catch (error) {
    console.error("Error inserting owner profile:", error);
    res.status(500).json({ message: "Failed to create owner profile." });
  }
});



// Logout route
app.post('/logout', async (req, res) => {
  const { email } = req.body;

  try {
    // Increment token_version to invalidate old refresh tokens
    await pool.query(
      `UPDATE users 
       SET status = ?, is_online = 0, last_active = CURRENT_TIMESTAMP, token_version = token_version + 1 
       WHERE email = ?`,
      ['inactive', email]
    );

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true, // set to false for localhost/dev
      sameSite: 'Strict'
    });

    res.json({ message: 'Logged out successfully' });

  } catch (err) {
    console.error('Error during logout:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/refresh-token', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    // 🔒 Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);

    // 🔎 Fetch current token version from DB
    const [rows] = await pool.query(
      'SELECT token_version FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dbTokenVersion = rows[0].token_version;

    // ❌ Token version mismatch means user logged out / invalidated token
    if (dbTokenVersion !== decoded.token_version) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }

    // ✅ Update last active
    await pool.query(
      'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?',
      [decoded.id]
    );

    // 🔐 Generate new access token
    const newAccessToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        token_version: dbTokenVersion
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh token error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});


// Get the logged-in user's details
app.get('/api/user', authenticateJWT, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const userId = req.user.id; // ✅ Move this up here first!

    // Update last_active timestamp
    await pool.query('UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?', [userId]);

    // Fetch full user details
    const [results] = await pool.query(
      `SELECT 
         id,
         full_name,
         email,
         phone_number,
         role,
         profile_image,
         country,
         state_or_region,
         city,
         address,
         bio,
         dob
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone_number || "N/A",
      role: user.role,
      profile_image: user.profile_image || "/assets/default_profile.jpg",
      country: user.country || "",
      state_or_region: user.state_or_region || "",
      city: user.city || "",
      address: user.address || "",
      bio: user.bio || "",
      dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
    });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


//Forgot password
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (!user.length) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token and expiry time (1 hour)
    const token = crypto.randomBytes(20).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await pool.query("UPDATE users SET reset_token = ?, reset_expires = ? WHERE email = ?", [token, expires, email]);

    // Reset link
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    //email reset link
await transporter.sendMail({
  from: `"PropFundr Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "🔒 Reset Your Password - PropFundr",
  html: `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; border-radius: 10px; background-color: #ffffff; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="background-color: #27ae60; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px;">Password Reset Request</h1>
      </div>
      <div style="padding: 30px 20px; color: #333;">
        <p style="font-size: 16px;">Hi there 👋,</p>
        <p style="font-size: 16px;">We received a request to reset your PropFundr password.</p>
        <p style="font-size: 16px;">Click the button below to securely update your password:</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #27ae60; color: #ffffff; padding: 14px 28px; border-radius: 5px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #555;">If you did not request this password reset, you can safely ignore this email. Your account remains secure.</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999;">Need help? Contact our support team.</p>
      </div>
      <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999;">
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </div>
    </div>
  `,
  text: `Hi,\n\nWe received a request to reset your PropFundr password.\n\nClick the link below to reset your password:\n\n${resetLink}\n\nIf you didn’t request this, please ignore this message.\n\n– PropFundr Support`
});

    res.json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(500).json({ message: "Something went wrong. Try again later." });
  }
});


app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const [user] = await pool.query("SELECT * FROM users WHERE reset_token = ? AND reset_expires > NOW()", [token]);

    if (!user.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await pool.query("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?", [hashedPassword, user[0].id]);

    res.json({ message: "Password reset successful." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});


// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // include file extension
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  res.send({
    message: 'File uploaded successfully!',
    file: req.file,
  });
});

const insertNotification = async (userId, message, type = "General") => {
  if (!userId) {
    console.error("🚨 Error: Attempted to insert a notification with NULL user_id. Skipping...");
    return;
  }

  const query = `
    INSERT INTO notifications (user_id, message, type, read_status, created_at)
    VALUES (?, ?, ?, 'unread', NOW())
  `;

  try {
    await pool.query(query, [userId, message, type]);
    console.log(`✅ Notification sent to User ${userId}: ${message}`);
  } catch (err) {
    console.error("❌ Error inserting notification:", err);
  }
};

app.get('/api/user/profile', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Get the user's ID from the JWT

    // Query to fetch the user by ID using async/await
    const [results] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);

    const user = results[0]; // Assuming only one user will be returned

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(user); // Log user object for debugging

    // If profile_image exists, use it; otherwise, default to a placeholder image
    const profileImagePath = user.profile_image ? `/uploads/${user.profile_image}` : '/assets/default_profile.jpg';

    res.json({
      profileImage: profileImagePath, // Send the image path to the frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


//update user profile and setting
app.post("/api/settings/update", authenticateJWT, upload.single("profile_image"), async (req, res) => {
  const {
    full_name,
    email,
    phone_number,
    country,
    state_or_region,
    city,
    address,
    bio,
    dob,
    settings: settingsJSON,
  } = req.body;

  const userId = req.user.id;
  let profileImage = null;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    // Fetch the current user details
    const [userResult] = await pool.query("SELECT profile_image FROM users WHERE id = ?", [userId]);
    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Keep existing profile image if no new image uploaded
    profileImage = userResult[0].profile_image;
    if (req.file) {
      profileImage = req.file.filename;
    }

    // Safely parse settings
    let settings = {};
    if (settingsJSON && settingsJSON !== "undefined") {
      try {
        settings = JSON.parse(settingsJSON);
      } catch (error) {
        console.error("Error parsing settings JSON:", error);
        return res.status(400).json({ error: "Invalid settings format" });
      }
    }

    // Format dob
    const formatDob = (dob) => {
      if (!dob) return null;
      return new Date(dob).toISOString().split("T")[0];
    };
    const formattedDob = formatDob(dob);

    // Update user info
    let query = `
      UPDATE users SET
        full_name = ?, 
        phone_number = ?, 
        profile_image = ?, 
        country = ?, 
        state_or_region = ?, 
        city = ?, 
        address = ?, 
        bio = ?, 
        dob = ?
      WHERE id = ?
    `;
    let values = [
      full_name,
      phone_number,
      profileImage,
      country || null,
      state_or_region || null,
      city || null,
      address || null,
      bio || null,
      formattedDob,
      userId,
    ];

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      query = `
        UPDATE users SET
          full_name = ?, 
          phone_number = ?, 
          password = ?, 
          profile_image = ?, 
          country = ?, 
          state_or_region = ?, 
          city = ?, 
          address = ?, 
          bio = ?, 
          dob = ?
        WHERE id = ?
      `;
      values = [
        full_name,
        phone_number,
        hashedPassword,
        profileImage,
        country || null,
        state_or_region || null,
        city || null,
        address || null,
        bio || null,
        formattedDob,
        userId,
      ];
    }

    await pool.query(query, values);

    // Update user settings
    const userSettingsQuery = `
      UPDATE settings SET
        notifications = ?, 
        two_factor = ?, 
        transaction_updates = ?, 
        investment_updates = ?, 
        auto_invest = ?
      WHERE user_id = ?
    `;
    const userSettingsValues = [
      settings.notifications !== undefined ? settings.notifications : false,
      settings.two_factor !== undefined ? settings.two_factor : false,
      settings.transaction_updates !== undefined ? settings.transaction_updates : false,
      settings.investment_updates !== undefined ? settings.investment_updates : false,
      settings.auto_invest !== undefined ? settings.auto_invest : false,
      userId,
    ];

    await pool.query(userSettingsQuery, userSettingsValues);

    await logAccess(userId, ip, 'User updated their Profile and settings');

    res.json({ message: "Profile and settings updated successfully", profile_image: profileImage });

  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/api/settings/:id", async (req, res) => {
  const userId = req.params.id;

  try {
      const [rows] = await pool.query("SELECT * FROM settings WHERE user_id = ?", [userId]);
      
      if (rows.length === 0) {
          // No settings found, create default settings
          const defaultSettings = {
            user_id: userId,
            notifications: false,
            two_factor: false,
            transaction_updates: false,
            investment_updates: false,
            auto_invest: false
        };
        
        await pool.query("INSERT INTO settings (user_id, notifications, two_factor, transaction_updates, investment_updates, auto_invest) VALUES (?, ?, ?, ?, ?, ?)", 
            [defaultSettings.user_id, defaultSettings.notifications, defaultSettings.two_factor, defaultSettings.transaction_updates, defaultSettings.investment_updates, defaultSettings.auto_invest]);
        

          return res.status(200).json(defaultSettings); // Send back the default settings
      }

      res.status(200).json(rows[0]); // Return existing settings

  } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});



app.post("/api/settings/update", authenticateJWT, async (req, res) => {
  const { updates } = req.body;
  const userId = req.user.id; // Extract user ID from token

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }

  try {
    const allowedKeys = ['notifications', 'two_factor', 'transaction_updates', 'investment_updates', 'auto_invest'];
    const updateFields = [];
    const values = [];

    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No valid settings to update" });
    }

    values.push(userId);

    const query = `
      UPDATE settings 
      SET ${updateFields.join(", ")}, date_modified = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

    await pool.query(query, values);

    return res.status(200).json({ message: "Settings updated successfully" });

  } catch (error) {
    console.error("Error updating settings:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/change-password", authenticateJWT, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id; // Extract from token
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
try {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
await pool.query("UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?", [hashedPassword, userId]);

  await logAccess(userId, ip, 'User updated their password from their settings page.');

  // ✅ Fetch user email and name to send email
  const [userResult] = await pool.query("SELECT full_name, email FROM users WHERE id = ?", [userId]);
  const user = userResult[0];

  if (user) {
    await sendPasswordChangeEmail(user.email, user.full_name);
  }

  res.json({ message: "Password updated successfully" });
} catch (error) {
  console.error("Error updating password:", error);
  res.status(500).json({ message: "Internal server error" });
}

});

const sendPasswordChangeEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: `"PropFundr Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your PropFundr Password Was Changed',
      html: `
        <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #27ae60; color: #fff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">Password Change Confirmation</h2>
          </div>
          <div style="padding: 30px 20px; color: #333;">
            <p style="font-size: 16px;">Hi ${fullName},</p>
            <p style="font-size: 16px;">We’re confirming that your <strong>PropFundr</strong> account password was successfully updated.</p>
            <p style="font-size: 16px;">If you didn’t make this change, <a href="[LINK_TO_RESET_PAGE]" style="color: #27ae60; text-decoration: underline;">reset your password immediately</a> or contact our support team.</p>

            <p style="margin-top: 30px; font-size: 14px; color: #555;">Thank you for staying secure with PropFundr.</p>
            <p style="font-size: 14px;">– The PropFundr Team</p>
          </div>
          <div style="background-color: #f4f4f4; text-align: center; padding: 15px; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} PropFundr. All rights reserved.
          </div>
        </div>
      `,
      text: `Hi ${fullName},\n\nThis is a confirmation that your PropFundr password was successfully changed.\n\nIf this wasn’t you, please reset your password immediately or contact our support team.\n\n– The PropFundr Team`
    };

    await transporter.sendMail(mailOptions);
       console.log(`Password change email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send password change email:', error);
  }
};


//endpoint for 2factor authentication

app.post("/api/request-otp", authenticateJWT, async (req, res) => {
  const { method } = req.body;
  const userEmail = req.user.email;
  const userId = req.user.id; // ✅ Ensure userId is retrieved correctly

  if (!userEmail || !userId) {
    console.error("❌ Missing user email or ID.");
    return res.status(400).json({ message: "User email or ID is missing" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
  console.log(`🚀 Generated OTP for ${userEmail}: ${otp}`); // ✅ Log OTP before saving

  try {
    // ✅ First, store the OTP in the database
    const [result] = await pool.query("UPDATE users SET otp = ? WHERE id = ?", [otp, userId]);

    if (result.affectedRows === 0) {
      console.error("❌ OTP update failed for user:", userId);
      return res.status(500).json({ message: "Failed to store OTP" });
    }

    console.log(`✅ OTP saved in DB for user ${userId}`);

    // ✅ Then, send OTP via email
    if (method === "email") {
      await sendOtpEmail(userEmail, otp);
      console.log(`📩 OTP sent to ${userEmail}`);
      res.json({ success: true, message: "OTP sent to your email" });
    } else {
      res.status(400).json({ message: "Invalid OTP request method" });
    }
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP email" });
  }
});

app.post("/api/enable-2fa", authenticateJWT, async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!otp || !userId) {
    console.error("❌ OTP or userId is missing.");
    return res.status(400).json({ success: false, message: "OTP or User ID missing" });
  }

  try {
    // ✅ Retrieve user OTP from database
    const [rows] = await pool.query("SELECT otp FROM users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      console.error("❌ User not found in DB.");
      return res.status(400).json({ success: false, message: "User not found" });
    }

    const savedOtp = rows[0].otp;
    console.log(`🔍 Stored OTP in DB: ${savedOtp}`);
    console.log(`🔍 OTP received from frontend: ${otp}`);

    // ✅ Ensure OTPs match (convert to string just in case)
    if (savedOtp.toString() !== otp.toString()) {
      console.error("❌ OTP mismatch. Verification failed.");
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // ✅ OTP matched! Proceed with enabling 2FA
    await pool.query("UPDATE users SET otp = NULL WHERE id = ?", [userId]); // Clear OTP after use
    await pool.query("UPDATE settings SET two_factor = 1 WHERE user_id = ?", [userId]);

    await logAccess(userId, ip, 'User Enabled their 2FA successfully.');
    console.log("✅ 2FA successfully enabled!");
    res.json({ success: true, message: "2FA enabled successfully" });

  } catch (error) {
    console.error("❌ Error enabling 2FA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Function to send OTP via email for 2FA
const sendOtpEmail = async (userEmail, otp) => {
  if (!userEmail) {
    console.error("❌ No recipient email provided!");
    return;
  }

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 30px;">
        <h2 style="color: #2c3e50; text-align: center;">🔐 Two-Factor Authentication</h2>
        <p style="font-size: 16px;">Hello,</p>
        <p style="font-size: 16px;">To proceed with your secure login to <strong>PropFundr</strong>, please enter the following One-Time Password (OTP):</p>

        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; background-color: #27ae60; color: white; padding: 15px 30px; font-size: 26px; font-weight: bold; border-radius: 8px; letter-spacing: 2px;">
            ${otp}
          </span>
        </div>

        <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
        <p style="font-size: 14px; color: #555;">If you didn’t request this code, please ignore this email or contact our support team immediately.</p>

        <p style="margin-top: 40px; font-size: 14px;">Thank you,<br />The PropFundr Security Team</p>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"PropFundr Security" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "🔐 Your PropFundr OTP Code",
    html: htmlContent,
    text: `Your PropFundr OTP is: ${otp}. It will expire in 10 minutes. If this wasn't you, please ignore this email or contact PropFundr support.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};



app.get("/api/get-2fa-status", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query("SELECT two_factor FROM settings WHERE user_id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User settings not found" });
    }

    res.json({ success: true, twoFactorEnabled: rows[0].two_factor === 1 });
  } catch (error) {
    console.error("❌ Error fetching 2FA status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/api/disable-2fa", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try {
    await pool.query("UPDATE settings SET two_factor = 0 WHERE user_id = ?", [userId]);

    await logAccess(userId, ip, 'User disabled their 2FA.');
    res.json({ success: true });

  } catch (error) {
    console.error("❌ Error disabling 2FA:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//For all users
app.get("/api/access-logs/:userId", authenticateJWT, async (req, res) => {
  const { userId } = req.params;

  try {
    const [logs] = await pool.query(
      "SELECT log_details, log_time FROM access_logs WHERE user_id = ? ORDER BY log_time DESC LIMIT 10",
      [userId]
    );

    if (logs.length === 0) {
      return res.json([]);
    }

    res.json(logs); // Send both details and time
  } catch (error) {
    console.error("Error fetching access logs:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Fetch KYC status
app.get("/api/get-kyc-status", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    const [kycRows] = await pool.query("SELECT status FROM kyc_submissions WHERE user_id = ?", [userId]);

    if (kycRows.length === 0) {
      // User has not submitted KYC at all
      return res.json({ success: true, kycStatus: "not_submitted" });
    }

    const kycStatus = kycRows[0].status; // 'pending', 'verified', or 'rejected'
    return res.json({ success: true, kycStatus });

  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Submit KYC documents with email notification after successful submission
app.post("/api/submit-kyc", authenticateJWT, upload.fields([
  { name: "id_front", maxCount: 1 },
  { name: "id_back", maxCount: 1 },
  { name: "address_proof", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "doc_with_user_photo", maxCount: 1 }
]), async (req, res) => {
  const { full_name, dob, id_type, id_number, address } = req.body;
  const userId = req.user.id;

  try {
    const idFrontPath = req.files["id_front"]?.[0]?.path || null;
    const idBackPath = req.files["id_back"]?.[0]?.path || null;
    const addressProofPath = req.files["address_proof"]?.[0]?.path || null;
    const selfiePath = req.files["selfie"]?.[0]?.path || null;
    const docWithUserPhotoPath = req.files["doc_with_user_photo"]?.[0]?.path || null;

    // Save KYC submission
    await pool.query(
      `INSERT INTO kyc_submissions 
        (user_id, full_name, dob, id_type, id_number, id_front, id_back, address, address_proof, selfie, doc_with_user_photo, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        full_name,
        dob,
        id_type,
        id_number,
        idFrontPath,
        idBackPath,
        address,
        addressProofPath,
        selfiePath,
        docWithUserPhotoPath
      ]
    );
    // Notify admins
    const [adminUsers] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    const message = `A new KYC request has been submitted by user ID ${userId}.`;
    const type = "kyc_submission";

    const insertNotifications = adminUsers.map(admin =>
      pool.query(
        "INSERT INTO notifications (user_id, message, type, read_status) VALUES (?, ?, ?, 'unread')",
        [admin.id, message, type]
      )
    );
    await Promise.all(insertNotifications);

   // KYC Submission Confirmation Email
if (userEmail) {
 const htmlContent = `
  <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f0f4f8; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); padding: 40px;">
      <h2 style="color: #2c3e50; margin-bottom: 10px;">✅ KYC Documents Submitted</h2>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Hi there,
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        We’ve successfully received your <strong>KYC documents</strong>. Our compliance team is now reviewing your submission for verification.
      </p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        You’ll receive an update via email and in your <strong>PropFundr Dashboard</strong> once your KYC is approved, or if any additional information is required.
      </p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="http://192.168.100.30:3000" style="background-color: #27ae60; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px;">Go to Dashboard</a>
      </div>

      <p style="font-size: 14px; color: #555;">Thank you for verifying your identity and helping us keep the PropFundr platform safe and secure.</p>
      <p style="margin-top: 40px; font-size: 14px;">Warm regards,<br/><strong>The PropFundr Compliance Team</strong></p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated message. Please do not reply.<br/>
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </p>
    </div>
  </div>
`;

  await transporter.sendMail({
    from: `"PropFundr Compliance" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "✅ KYC Submission Received",
    html: htmlContent,
    text: `Your KYC documents have been received and are under review. You’ll be notified when verification is complete. Thanks for using PropFundr.`
  });
}


    res.json({ success: true, message: "KYC submitted successfully. Awaiting approval." });

  } catch (error) {
    console.error("Error submitting KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/kyc-status", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query("SELECT * FROM kyc_submissions WHERE user_id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No KYC data found" });
    }

    const kyc = rows[0];

    res.json({
      full_name: kyc.full_name,
      dob: kyc.dob,
      id_type: kyc.id_type,
      id_number: kyc.id_number,
      address: kyc.address,
      status: kyc.status === 'verified' ? 'approved' : kyc.status === 'pending' ? 'pending' : 'rejected',
      review_notes: kyc.review_notes || "",
      id_front_url: kyc.id_front ? `http://192.168.100.30:5000/${kyc.id_front}` : null,
      id_back_url: kyc.id_back ? `http://192.168.100.30:5000/${kyc.id_back}` : null,
      address_proof_url: kyc.address_proof ? `http://192.168.100.30:5000/${kyc.address_proof}` : null,
      selfie_url: kyc.selfie ? `http://192.168.100.30:5000/${kyc.selfie}` : null,
      doc_with_user_photo_url: kyc.doc_with_user_photo ? `http://192.168.100.30:5000/${kyc.doc_with_user_photo}` : null
    });

  } catch (err) {
    console.error("KYC fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// user deletes account
app.delete("/api/user/delete", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // 🔹 Fetch email and name BEFORE deletion
    const [userRows] = await pool.query("SELECT full_name, email FROM users WHERE id = ?", [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const { full_name, email } = userRows[0];

    // 🔹 Delete the user
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    console.log(`🚨 User ${userId} and related data deleted via CASCADE.`);
//email notif for account deletion
  const mailOptions = {
  from: `"PropFundr Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Your PropFundr Account Has Been Terminated",
  html: `
    <div style="font-family: 'Segoe UI', Roboto, sans-serif; background-color: #f4f6f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 40px;">
        <h2 style="color: #c0392b; margin-bottom: 10px;">Account Terminated</h2>
        <p style="font-size: 16px; color: #2c3e50; line-height: 1.6;">
          Hi ${full_name},
        </p>
        <p style="font-size: 16px; color: #2c3e50; line-height: 1.6;">
          We want to let you know that your <strong>PropFundr account has been permanently deleted</strong>. We're sorry to see you go.
        </p>
        <p style="font-size: 16px; color: #2c3e50; line-height: 1.6;">
          All your data, including investment history and personal information, has been removed in accordance with our data retention policies.
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #fceaea; border-left: 4px solid #e74c3c; border-radius: 6px;">
          <p style="margin: 0; font-size: 15px; color: #c0392b;">
            <strong>Didn’t request this?</strong> Please contact our support team immediately so we can help secure your account.
          </p>
        </div>

        <p style="font-size: 14px; color: #34495e;">
          You’re always welcome to return to PropFundr in the future. We’d love to have you back.
        </p>

        <p style="margin-top: 40px; font-size: 14px;">Warm regards,<br /><strong>The PropFundr Support Team</strong></p>
        
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply.<br />
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Error sending deletion email:", err);
      } else {
        console.log("📧 Deletion email sent:", info.response);
      }
    });

    return res.json({ success: true, message: "Account and related data deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    return res.status(500).json({ error: "Failed to delete account." });
  }
});



// Other routes (e.g., user profile, dashboard) would go here...

// Property Listing - Owners can add properties
//terms for owner listing a property
//email notif for this
const sendAgreementConfirmationEmail = async (userEmail, fullName) => {
  if (!userEmail) {
    console.error("❌ No recipient email provided!");
    return;
  }

  const agreementUrl = "http://192.168.100.30:3000/agreement.pdf";//replace with actual link
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Your Agreement with PropFundr Has Been Recorded",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #2a4365;">Hello ${fullName || "Investor"},</h2>
          <p>Thank you for agreeing to the <strong>Property Listing Terms and Conditions</strong> on PropFundr.</p>
          <p>Your agreement has been successfully recorded and logged in our system.</p>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />

          <p>As a property owner on PropFundr, here’s what to expect next:</p>
          <ul>
            <li>Our team will review your submission and contact you for any required documentation.</li>
            <li>Your property listing will go through a due diligence process.</li>
            <li>You’ll receive real-time updates on the approval and listing process.</li>
          </ul>

          <div style="margin: 30px 0;">
            <a href="${agreementUrl}" target="_blank" style="display: inline-block; background-color: #2b6cb0; color: #ffffff; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
              📄 View Signed Agreement
            </a>
          </div>

          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>

          <p style="margin-top: 30px;">Cheers,<br /><strong>The PropFundr Team</strong></p>

          <div style="font-size: 12px; color: #888; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            You’re receiving this email because you consented to our property listing terms. For assistance, contact support@propfundr.com.
          </div>
        </div>
      </div>
    `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Agreement confirmation email sent:", info.response);
  } catch (error) {
    console.error("❌ Failed to send agreement email:", error);
  }
};

// POST route to save agreement consent
app.post("/api/agreements", authenticateJWT, async (req, res) => {
  const { agreed, ipAddress, timestamp } = req.body;
  const userId = req.user.id;

  console.log("Received agreement data:", { agreed, ipAddress, timestamp, userId });

  if (!agreed || !ipAddress || !timestamp || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const formattedTimestamp = new Date(timestamp).toISOString().slice(0, 19).replace("T", " ");

    await pool.query(
      "INSERT INTO owner_agreements (user_id, ip_address, timestamp) VALUES (?, ?, ?)",
      [userId, ipAddress, formattedTimestamp]
    );

    // Get user's email and full name to send the email
    const [userRows] = await pool.query("SELECT email, full_name FROM users WHERE id = ?", [userId]);
    const user = userRows[0];

    if (user) {
      await sendAgreementConfirmationEmail(user.email, user.full_name);
    }

    res.json({ message: "Agreement recorded successfully and email sent." });
  } catch (error) {
    console.error("❌ Error saving agreement:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all properties for a specific owner

// Add a new property
app.post("/api/properties", authenticateJWT, async (req, res) => {
  const connection = await pool.getConnection();
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  await connection.beginTransaction();

  try {
    const owner_id = req.user.id;
    const { 
      title, category, description, location, price, funding_goal, 
      roi_percentage, term_duration_months, min_investment, start_date, end_date, closing_date, 
      latitude, longitude 
    } = req.body;

    const status = "Pending";
    const listing_fee = 50.00;

    // 🏦 Check wallet balance (and lock it for update)
    const [wallet] = await connection.query(
      `SELECT available_balance FROM wallets WHERE user_id = ? FOR UPDATE;`,
      [owner_id]
    );

    if (wallet.length === 0 || parseFloat(wallet[0].available_balance) < listing_fee) {
      await connection.rollback();
      return res.status(400).json({ error: "Insufficient balance to list property" });
    }

    // 🏠 Insert the new property
    const [propertyResult] = await connection.query(
      `INSERT INTO properties 
        (owner_id, title, category, description, location, latitude, longitude, price, funding_goal, roi_percentage, 
         term_duration_months, min_investment, status, start_date, end_date, closing_date, funded_amount, total_funded, investment_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [owner_id, title, category, description, location, latitude, longitude, price, funding_goal, roi_percentage, 
      term_duration_months,  min_investment, status, start_date, end_date, closing_date, 0.00, 0.00, 'open']
    );

    if (propertyResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ error: "Failed to create property" });
    }

    const newPropertyId = propertyResult.insertId;

    // 🔄 Update project_id in properties table
    await connection.query(
      `UPDATE properties SET project_id = ? WHERE propertyId = ?;`,
      [newPropertyId, newPropertyId]
    );

    // 💸 Deduct listing fee from wallet
    await connection.query(
      `UPDATE wallets SET available_balance = available_balance - ? WHERE user_id = ?;`,
      [listing_fee, owner_id]
    );

    // 🧾 Insert transaction record (type: 'fee')
    const [transactionResult] = await connection.query(
      `INSERT INTO transactions 
        (user_id, type, amount, status, payment_method, project_id, description, fees_collected) 
        VALUES (?, 'fee', ?, 'approved', 'platform', ?, ?, ?);`,
      [owner_id, listing_fee, newPropertyId, 'Listing fee for new property', listing_fee]
    );

    const transactionId = transactionResult.insertId;

    // 📊 Insert platform fee record
    await connection.query(
      `INSERT INTO platform_fees 
        (transaction_id, fee_type, fee_amount, status) 
        VALUES (?, 'listing_fee', ?, 'active');`,
      [transactionId, listing_fee]
    );

    // 🔔 Notify Admins
    const [ownerData] = await connection.query('SELECT full_name FROM users WHERE id = ?', [owner_id]);
    const ownerName = ownerData.length > 0 ? ownerData[0].full_name : "Unknown Owner";

    const [adminRows] = await connection.query('SELECT id FROM users WHERE role = "admin"');
    for (const admin of adminRows) {
      await insertNotification(admin.id, `New property listed: ${title} by ${ownerName} (Pending Approval).`, "Admin Alert");

      io.emit(`admin_notification_${admin.id}`, {
        message: `New property listed: ${title} by ${ownerName} (Pending Approval).`,
        type: "Admin Alert"
      });
    }

    // 🧾 Log the access
    await logAccess(userId, ip, 'User successfully listed a property.');

    // 📧 Email Owner
    const [ownerEmailData] = await connection.query('SELECT full_name, email FROM users WHERE id = ?', [owner_id]);

    if (ownerEmailData.length > 0) {
      const ownerEmail = ownerEmailData[0].email;
      const ownerName = ownerEmailData[0].full_name;

    const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: ownerEmail,
  subject: `Your Property Listing "${title}" is Pending Approval`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 40px;">
        <h2 style="color: #27ae60; margin-bottom: 15px;">🎉 Property Listing Submitted!</h2>
        <p style="font-size: 16px; color: #2c3e50;">Hi <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #2c3e50;">
          Thank you for listing your property <strong>"${title}"</strong> on <strong>PropFundr</strong>.
        </p>
        <p style="font-size: 16px; color: #2c3e50; margin-top: 20px;">
          To ensure a smooth approval process, please <strong>upload all necessary documents and images</strong> in the Manage Documents & Images section. Incomplete submissions may delay approval.
        </p>
        <p style="font-size: 16px; color: #2c3e50; margin-top: 20px;">
          Our team will review your listing shortly. Once approved, it will be visible to potential investors as an official investment opportunity.
        </p>
        <p style="font-size: 16px; color: #2c3e50; margin-top: 25px;">
          Feel free to monitor your dashboard for status updates and messages.
        </p>
        <br />
        <p style="font-size: 16px; color: #2c3e50;">Best regards,<br/><strong>The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply.<br />
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email to owner:", error);
        } else {
          console.log("Owner notification email sent:", info.response);
        }
      });
    }

    // ✅ Commit transaction
    await connection.commit();
    res.json({ message: "Property listed successfully", propertyId: newPropertyId });

  } catch (err) {
    await connection.rollback();
    console.error("Error creating property:", err.sqlMessage || err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    connection.release();
  }
});

// Fetch properties with images and location data
app.get("/api/properties", authenticateJWT, async (req, res) => {
  try {
    const owner_id = req.user.id;
    if (!owner_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

 const propertiesQuery = `
  SELECT 
    p.*,
    COALESCE(GROUP_CONCAT(DISTINCT pi.image_url), '') AS images,
    p.latitude,
    p.longitude,
    pr.status AS project_status,
    MAX(i.investment_status) AS latest_investment_status
  FROM properties p
  LEFT JOIN property_images pi ON p.propertyId = pi.propertyId
  LEFT JOIN projects pr ON pr.property_id = p.propertyId
  LEFT JOIN investments i ON i.project_id = pr.property_id
  WHERE p.owner_id = ?
  GROUP BY p.propertyId
  ORDER BY p.created_at DESC;
`;

    const [properties] = await pool.query(propertiesQuery, [owner_id]);

    const formattedProperties = properties.map((property) => ({
      ...property,
      images: property.images ? property.images.split(",") : [],
      start_date: property.start_date,
      end_date: property.end_date,
      closing_date: property.closing_date,
      latitude: parseFloat(property.latitude),  // Ensure correct number format
      longitude: parseFloat(property.longitude)
    }));

    res.status(200).json(formattedProperties);
  } catch (err) {
    console.error("🔥 Error fetching properties:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.sqlMessage });
  }
});



// Update property details (Only Update Changed Fields)
app.put("/api/properties/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const updates = req.body;

    // If no fields to update, return an error
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    // Build dynamic SQL query
    let query = "UPDATE properties SET ";
    const values = [];

    Object.entries(updates).forEach(([key, value], index) => {
      query += `${key} = ?`;
      if (index < Object.keys(updates).length - 1) query += ", ";
      values.push(value);
    });

    query += ", updated_at = NOW() WHERE propertyId = ?";
    values.push(propertyId);
const [result] = await pool.query(query, values);

if (result.affectedRows === 0) {
  return res.status(404).json({ error: "Property not found" });
}

// ✅ Fetch updated property data
const [propertyData] = await pool.query(
  'SELECT owner_id, title FROM properties WHERE propertyId = ?',
  [propertyId]
);

if (!propertyData.length) {
  return res.status(404).json({ error: "Property not found after update" });
}

const { owner_id, title } = propertyData[0];

// 🔔 Notify Admins
const [ownerData] = await pool.query('SELECT full_name FROM users WHERE id = ?', [owner_id]);
const ownerName = ownerData.length > 0 ? ownerData[0].full_name : "Unknown Owner";

const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');
for (const admin of adminRows) {
  await insertNotification(admin.id, `Property updated/edited: ${title} by ${ownerName} (View update).`, "Admin Alert");

  io.emit(`admin_notification_${admin.id}`, {
    message: `Property updated/edited: ${title} by ${ownerName} (View update).`,
    type: "Admin Alert"
  });
}

res.json({ message: "Property updated successfully", propertyId });
  
  } catch (err) {
    console.error("Error updating property:", err.sqlMessage || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Image Upload API
app.post("/api/properties/:propertyId/upload-image", upload.array("image", 5), async (req, res) => {
  const { propertyId } = req.params;

  if (!propertyId || isNaN(propertyId)) {
    return res.status(400).json({ error: "Invalid property ID" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  try {
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    // Insert each image into the database
    for (const imageUrl of imageUrls) {
      await pool.query(
        "INSERT INTO property_images (propertyId, image_url) VALUES (?, ?)",
        [propertyId, imageUrl]
      );
    }

    res.json({ success: true, imageUrls });
  } catch (error) {
    console.error("🔥 Database error:", error);
    res.status(500).json({ error: "Failed to upload images" });
  }
});


app.delete("/api/properties/delete-image", async (req, res) => {
  const { image_url } = req.body; // Get the image URL from frontend

  if (!image_url) {
      return res.status(400).json({ error: "Image URL is required." });
  }

  try {
      // Check if the image exists in the database
      const [rows] = await pool.query("SELECT * FROM property_images WHERE image_url = ?", [image_url]);

      if (rows.length === 0) {
          return res.status(404).json({ error: "Image not found in database." });
      }

      // Delete the image record from the database
      await pool.query("DELETE FROM property_images WHERE image_url = ?", [image_url]);

      // Delete the actual image file from the server (assuming images are in `uploads/`)
      const filePath = path.join(__dirname, "uploads", path.basename(image_url));

      fs.unlink(filePath, (err) => {
          if (err && err.code !== "ENOENT") { 
              console.error("Error deleting image file:", err);
              return res.status(500).json({ error: "Failed to delete image file." });
          }
      });

      res.json({ message: "Image deleted successfully!" });
  } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/properties/:propertyId/images", async (req, res) => {
  const { propertyId } = req.params;

  try {
    const [images] = await pool.query("SELECT image_url FROM property_images WHERE propertyId = ?", [propertyId]);

    if (!images.length) {
      return res.status(404).json({ message: "No images found" });
    }

    res.json(images.map((img) => img.image_url));
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Function to get owner details from the database
const getOwnerDetailsFromDatabase = async (ownerId) => {
  try {
    const [rows] = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [ownerId]);
    return rows[0]; // Make sure to handle case when owner is not found
  } catch (err) {
    console.error('Error fetching owner details:', err);
    throw new Error('Failed to get owner details');
  }
};

app.post('/api/properties/agreement', authenticateJWT, async (req, res) => {
  const { propertyId, hasAgreed } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;
  
  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required' });
  }

  try {
    await pool.query(
      "UPDATE properties SET has_agreed = ? WHERE id = ?",
      [hasAgreed, propertyId]
    );
    
    await logAccess(userId, ip, 'User agreed to Terms of Listing a Property on Propfundr.');
    res.status(200).json({ message: 'Agreement status updated successfully' });
  } catch (error) {
    console.error('Error updating agreement:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/properties/available', async (req, res) => {
  try {
    const [properties] = await pool.query(`
      SELECT 
        p.*, 
        (
          SELECT pi.image_url 
          FROM property_images pi 
          WHERE pi.propertyId = p.propertyId 
          LIMIT 1
        ) AS propertyImage
      FROM properties p
      WHERE p.status = 'Approved' AND p.investment_status = 'open'
    `);

    res.json(properties);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


//Owner Dashboard APIs
//
///
//actie projects

// Endpoint to fetch owner dashboard data
// Updated Financial Summary / Owner Dashboard API
app.get('/api/active-projects', authenticateJWT, async (req, res) => {
  console.log('Token Data:', req.user);
  const ownerId = req.user.id;
  console.log('Extracted Owner ID:', ownerId);

  const query = `
    SELECT
      apv.id,
      apv.name,
      apv.status,
      apv.startDate,
      apv.endDate,
      apv.property_id,
      COALESCE(SUM(i.amount), 0) AS totalInvestment,
      COALESCE((SUM(i.amount) / p.funding_goal) * 100, 0) AS fundingProgress,  
      apv.progress_percentage AS progressPercentage,
      apv.roi_percentage AS roiPercentage,
      COUNT(DISTINCT i.investor_id) AS investorCount,
      p.funding_goal AS fundingGoal,
      CASE 
        WHEN COALESCE(SUM(i.amount), 0) >= p.funding_goal THEN TRUE 
        ELSE FALSE 
      END AS isFunded,
      GROUP_CONCAT(DISTINCT m.description ORDER BY m.due_date ASC SEPARATOR ' | ') AS milestones
    FROM active_projects_view apv
    LEFT JOIN investments i ON apv.property_id = i.project_id
    LEFT JOIN properties p ON apv.property_id = p.project_id
    LEFT JOIN milestones m ON apv.property_id = m.project_id
    WHERE apv.owner_id = ?  
    GROUP BY apv.id, apv.name, apv.status, apv.startDate, apv.endDate, p.funding_goal, apv.progress_percentage, apv.roi_percentage;
  `;

  try {
    const [rows] = await pool.execute(query, [ownerId]);
    res.json({ projects: rows });
  } catch (error) {
    console.error("Error fetching active projects:", error);
    res.status(500).json({ error: "Failed to load active projects." });
  }
});



// Get all investment opportunities (with filtering)
//Get all investment opportunities (with filtering)
app.get("/api/investment-opportunities", async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = `
      SELECT 
        p.propertyId AS id, 
        p.title, 
        p.description, 
        p.category, 
        p.investment_status AS status, 
        p.end_date, 
        p.closing_date, 
        p.funding_goal, 
        p.min_investment,
        p.roi_percentage,
        p.location,
        p.latitude,  
        p.longitude, 
        p.owner_id, 
        COALESCE(SUM(f.total_funded), 0) AS amount_raised
      FROM properties p
      LEFT JOIN funding_progress f ON p.propertyId = f.propertyId
    `;

    let queryParams = [];
    let conditions = ["p.investment_status = 'open'", "p.status = 'Approved'"]; // 👈 Enforce approved only

    if (status) {
      conditions.push("p.investment_status = ?");
      queryParams.push(status);
    }

    if (category) {
      conditions.push("p.category = ?");
      queryParams.push(category);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " GROUP BY p.propertyId";

    console.log("🔹 Running Query:", query, queryParams);

    const [rows] = await pool.query(query, queryParams);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update investment status for properties with past closing dates with email notificatoon to various user in realtionn to thta property.
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Checking and closing expired investments...");

  const today = new Date().toISOString().split("T")[0];

  try {
    // Step 1: Get properties that need to be closed today
    const [toBeClosedProperties] = await pool.query(`
      SELECT p.propertyId, p.title, p.owner_id, p.closing_date, p.funded_amount, p.funding_goal, u.email, u.full_name
      FROM properties p
      JOIN users u ON p.owner_id = u.id
      WHERE p.closing_date < ? AND p.investment_status = 'open'`,
      [today]
    );

    // Step 2: Update their status to 'closed'
    if (toBeClosedProperties.length > 0) {
      await pool.query(`
        UPDATE properties 
        SET investment_status = 'closed' 
        WHERE closing_date < ? AND investment_status = 'open'`,
        [today]
      );

      console.log(`🔒 ${toBeClosedProperties.length} properties closed.`);

      // Step 3: Notify property owners
      for (const property of toBeClosedProperties) {
        const { title, funded_amount, funding_goal, email, full_name, closing_date } = property;
        const goalReached = parseFloat(funded_amount) >= parseFloat(funding_goal);

const messageHtml = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); padding: 40px;">
      <h2 style="color: #d32f2f; margin-bottom: 20px;">🏁 Investment Closed for "<span style="color: #333;">${title}</span>"</h2>
      <p style="font-size: 16px; color: #2c3e50;">Hi <strong>${full_name}</strong>,</p>
      <p style="font-size: 16px; color: #2c3e50;">
        Your property listing <strong>"${title}"</strong> on <strong>PropFundr</strong> has officially closed as of <strong>${closing_date}</strong>.
      </p>
      ${
        goalReached
          ? `<p style="font-size: 16px; color: #388e3c; margin-top: 20px;">🎯 <strong>Congratulations!</strong> The funding goal was reached successfully.</p>`
          : `<p style="font-size: 16px; color: #f44336; margin-top: 20px;">⚠️ Unfortunately, the funding goal was not reached. All raised funds will be refunded to the investors.</p>`
      }
      <p style="font-size: 16px; color: #2c3e50; margin-top: 25px;">
        You can view the final status and detailed funding information on your dashboard.
      </p>
      <br />
      <p style="font-size: 16px; color: #2c3e50;">Warm regards,<br /><strong>The PropFundr Team</strong></p>

      <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #999; text-align: center;">
        This is an automated message. Please do not reply.<br />
        © ${new Date().getFullYear()} PropFundr. All rights reserved.
      </p>
    </div>
  </div>
`;
        const mailOptions = {
          from: `"PropFundr" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: `Investment Closed: ${title}`,
          html: messageHtml
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error(`❌ Failed to send email to ${email}:`, error);
          } else {
            console.log(`📧 Email sent to owner of "${title}": ${info.response}`);
          }
        });
      }

      // Step 4: Notify Admins about newly closed properties
      const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');

      if (adminRows.length > 0) {
        for (let admin of adminRows) {
          for (let property of toBeClosedProperties) {
            await insertNotification(
              admin.id,
              `The investment for property "${property.title}" (ID: ${property.propertyId}) has been closed as of ${property.closing_date}.`,
              "Investment Closure Alert"
            );
          }
        }
        console.log("📩 Admins notified about closed investments.");
      } else {
        console.log("⚠️ No admins found to notify.");
      }
    } else {
      console.log("✅ No investments to close today.");
    }

    console.log("✅ Expired investment check complete.");
  } catch (err) {
    console.error("🔥 Error in investment closure cron job:", err);
  }
});


// Runs at 11:30 PM every night to process refund logic for failed projects based on closingdate being reached and funding goal not met
cron.schedule('30 23 * * *', async () => {
  console.log('🔄 Running refund logic for failed projects...');

  try {
    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Identify failed projects
    const [failedProjects] = await pool.query(`
      SELECT 
        p.id AS projectId,
        prop.propertyId,
        prop.funding_goal,
        COALESCE(SUM(i.amount), 0) AS amount_raised
      FROM projects p
      JOIN properties prop ON p.property_id = prop.propertyId
      LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'approved'
      WHERE prop.closing_date < ? AND p.status = 'Active'
      GROUP BY p.id, prop.propertyId, prop.funding_goal
      HAVING amount_raised < prop.funding_goal
    `, [today]);

    for (const project of failedProjects) {
      const { projectId, propertyId } = project;

      console.log(`❌ Project ${projectId} (Property ${propertyId}) failed to meet funding goal.`);

      // 2️⃣ Mark project as Failed
      await pool.query(`UPDATE projects SET status = 'Failed' WHERE id = ?`, [projectId]);

      // 3️⃣ Get approved investments for this project
      const [investments] = await pool.query(`
        SELECT id AS investmentId, investor_id, amount 
        FROM investments 
        WHERE project_id = ? AND status = 'approved'
      `, [projectId]);

      // 4️⃣ Notify Admins
      const [adminRows] = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
      for (const admin of adminRows) {
        await insertNotification(
          admin.id,
          `The project ${projectId} has failed as it did not meet the funding goal by the closing date.`,
          'Project Failure Notification'
        );
      }

      // 5️⃣ Process refunds
      for (const inv of investments) {
        const { investmentId, investor_id, amount } = inv;

        // Get transactions
        const [transactions] = await pool.query(`
          SELECT id FROM transactions 
          WHERE user_id = ? AND project_id = ? AND type = 'investment'
        `, [investor_id, projectId]);

        let totalInvestmentFee = 0;

        // Reverse fees
        for (const txn of transactions) {
          const txnId = txn.id;

          const [fees] = await pool.query(`
            SELECT fee_amount FROM platform_fees 
            WHERE transaction_id = ? AND fee_type = 'investment_fee' AND status = 'active'
          `, [txnId]);

          if (fees.length > 0) {
            const feeAmount = parseFloat(fees[0].fee_amount || 0);
            totalInvestmentFee += feeAmount;

            await pool.query(`
              UPDATE platform_fees 
              SET status = 'reversed' 
              WHERE transaction_id = ? AND fee_type = 'investment_fee'
            `, [txnId]);
          }
        }

        const totalRefund = amount + totalInvestmentFee;

        // Refund wallet
        await pool.query(`
          UPDATE wallets 
          SET available_balance = available_balance + ? 
          WHERE user_id = ?
        `, [totalRefund, investor_id]);

        // Mark investment as failed
        await pool.query(`
          UPDATE investments 
          SET investment_status = 'failed' 
          WHERE id = ?
        `, [investmentId]);

        // Record refund transaction
        await pool.query(`
          INSERT INTO transactions (user_id, project_id, amount, type, status, transaction_date) 
          VALUES (?, ?, ?, 'refund', 'approved', NOW())
        `, [investor_id, projectId, totalRefund]);

        // Notify investor
        await insertNotification(
          investor_id,
          `Your investment of ₦${amount.toFixed(2)} + ₦${totalInvestmentFee.toFixed(2)} fee refund for Project ${projectId} has been returned to your wallet.`,
          'Refund Processed'
        );

        // Email investor
        const [investorDetails] = await pool.query(`
          SELECT email, full_name FROM users WHERE id = ?
        `, [investor_id]);

        if (investorDetails.length > 0) {
          const { email: investorEmail, full_name: investorName } = investorDetails[0];

       const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: investorEmail,
  subject: 'Refund Processed for Your Investment',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); padding: 35px;">
        <h2 style="color: #1976d2; margin-bottom: 20px;">💸 Refund Processed</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${investorName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          We regret to inform you that the project <strong>#${projectId}</strong> did not meet its funding goal by the closing date.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 15px;">
          Your investment amount of <strong>₦${amount.toFixed(2)}</strong> along with the platform fee of <strong>₦${totalInvestmentFee.toFixed(2)}</strong> has been refunded to your wallet.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 25px;">
          We appreciate your trust and hope you find future investment opportunities on PropFundr.
        </p>
        <br />
        <p style="font-size: 16px; color: #333;">
          Best regards,<br/>
          <strong>The PropFundr Team</strong>
        </p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply.<br />
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `,
};          await transporter.sendMail(mailOptions);
        }

        console.log(`✅ Refunded ₦${totalRefund.toFixed(2)} to investor ${investor_id} for project ${projectId}`);

        // Notify Owner
        const [ownerRows] = await pool.query(`
          SELECT owner_id FROM properties WHERE propertyId = ?
        `, [propertyId]);

        if (ownerRows.length > 0) {
          const ownerId = ownerRows[0].owner_id;

          await insertNotification(
            ownerId,
            `Your project ${projectId} failed as it did not reach the funding goal by the closing date.`,
            'Project Failure Notification'
          );

          const [ownerDetails] = await pool.query(`
            SELECT email, full_name FROM users WHERE id = ?
          `, [ownerId]);

          if (ownerDetails.length > 0) {
            const { email: ownerEmail, full_name: ownerName } = ownerDetails[0];

const ownerMailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: ownerEmail,
  subject: 'Update on Your Project Funding Status',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); padding: 35px;">
        <h2 style="color: #d32f2f; margin-bottom: 20px;">⚠️ Funding Goal Not Met</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${ownerName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          Unfortunately, your project <strong>#${projectId}</strong> did not reach its funding goal by the closing date.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 15px;">
          All investments have been refunded to the respective investors’ wallets.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 15px;">
          You can review your project details and repost or update your listing to try again.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 25px;">
          Thank you for trusting PropFundr. We're here to support your journey.
        </p>
        <br />
        <p style="font-size: 16px; color: #333;">
          Warm regards,<br/>
          <strong>The PropFundr Team</strong>
        </p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply.<br />
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `,
};
            await transporter.sendMail(ownerMailOptions);
          }
        }
      }
    }
  } catch (err) {
    console.error('🔥 Refund cronjob failed:', err.message || err);
  }
});



//Get single invement usefll in invemnet details page
app.get("/api/investment-opportunities/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
    SELECT 
  p.propertyId AS id, 
  p.title, 
  p.description, 
  p.category, 
  p.investment_status AS status, 
  p.end_date, 
  p.closing_date, 
  p.funding_goal, 
  p.latitude, 
  p.longitude, 
  p.roi_percentage AS expected_return,     -- ✅
  p.term_duration_months AS term, 
  p.min_investment AS min_investment, 
  COALESCE(SUM(i.amount), 0) AS amount_raised,
  COUNT(DISTINCT i.investor_id) AS investors
FROM properties p
LEFT JOIN investments i ON p.propertyId = i.project_id
WHERE p.propertyId = ?
GROUP BY p.propertyId
    `;

    console.log("🔹 Fetching property with ID:", id);

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Investment opportunity not found" });
    }

    const property = rows[0];

    // Format dates nicely
    property.end_date = property.end_date ? property.end_date.toISOString().split("T")[0] : null;
    property.closing_date = property.closing_date ? property.closing_date.toISOString().split("T")[0] : null;

    res.json(property);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Route to get only Active and Funded projects
app.get('/api/projects', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [results] = await pool.query(
      `SELECT * FROM Projects 
       WHERE owner_id = ? 
       AND status IN ('Active', 'Funded')`,
      [ownerId]
    );

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error', error: err });
  }
});


// Define the endpoint to get project progress
app.get('/api/project-progress', async (req, res) => {
  try {
    const projectId = req.query.projectId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const milestonesQuery = 'SELECT name, date, status FROM milestones WHERE project_id = $1';
    const fundingQuery = 'SELECT goal, raised FROM funding WHERE project_id = $1';

    const milestonesResult = await pool.query(milestonesQuery, [projectId]);
    const fundingResult = await pool.query(fundingQuery, [projectId]);

    if (milestonesResult.rows.length === 0 || fundingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const milestones = milestonesResult.rows;
    const funding = fundingResult.rows[0];

    return res.json({ milestones, funding });
  } catch (error) {
    console.error('Error fetching project progress:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/owner/overview', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log("🔍 Owner ID:", ownerId);

    // Query property + investment stats
  const [overviewResults] = await pool.query(
  `SELECT 
    (SELECT COALESCE(SUM(price), 0) FROM properties WHERE owner_id = ?) AS totalPropertyValue,
    COALESCE(SUM(CASE WHEN i.investment_status IN ('active', 'completed') THEN i.amount ELSE 0 END), 0) AS totalFundsRaised,
    COALESCE(AVG(CASE WHEN i.investment_status IN ('active', 'completed') THEN i.roi_percentage ELSE NULL END), 0) AS overallPerformance
  FROM properties p
  LEFT JOIN investments i ON p.propertyId = i.project_id
  WHERE p.owner_id = ?`, 
  [ownerId, ownerId]
);
    // Query KYC status
    const [kycResults] = await pool.query(
      `SELECT status FROM kyc_submissions WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
      [ownerId]
    );

    const overviewData = overviewResults[0] || {
      totalPropertyValue: 0,
      totalFundsRaised: 0,
      overallPerformance: 0
    };

    overviewData.kycStatus = kycResults.length > 0 ? kycResults[0].status : "not_submitted";

    console.log("📊 Final API Response:", overviewData);

    res.json(overviewData);
  } catch (error) {
    console.error("❌ Database Query Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Financial Reports API for the owner
app.get('/owner/financial-reports', async (req, res) => {
  try {
    const projectId = req.query.projectId;

    // Check if projectId is provided and is a valid number
    if (!projectId || isNaN(projectId)) {
      return res.status(400).json({ message: 'Invalid or missing projectId parameter' });
    }

    // Query to get the summary financial data
    const financialSummaryQuery = `
      SELECT 
        total_revenue, 
        total_expenses, 
        net_profit, 
        roi
      FROM financial_summary
      WHERE project_id = ?;
    `;
    
    // Query to get the detailed transaction report
    const transactionsQuery = `
      SELECT 
        transaction_date AS date, 
        description, 
        amount, 
        type
      FROM transactions
      WHERE project_id = ?
      ORDER BY transaction_date DESC;
    `;

    // Get financial summary and transactions from the database
    const financialSummaryResult = await pool.query(financialSummaryQuery, [projectId]);
    const transactionsResult = await pool.query(transactionsQuery, [projectId]);

    if (financialSummaryResult.rows.length === 0 || transactionsResult.rows.length === 0) {
      return res.status(404).json({ message: 'No financial data found for this project' });
    }

    const financialData = {
      totalRevenue: financialSummaryResult.rows[0].total_revenue,
      totalExpenses: financialSummaryResult.rows[0].total_expenses,
      netProfit: financialSummaryResult.rows[0].net_profit,
      roi: financialSummaryResult.rows[0].roi,
      transactions: transactionsResult.rows,
    };

    return res.json(financialData);

  } catch (error) {
    console.error('Error fetching financial reports:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


// Get Owner Details
app.get('/api/owner/:owner_id', authenticateJWT, async (req, res) => {
  const { owner_id } = req.params;

  try {
    // Fetch owner basic info including profile_image
    const [userResult] = await pool.query(
      'SELECT full_name, email, phone_number, profile_image FROM users WHERE id = ? AND role = "owner"',
      [owner_id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const ownerInfo = userResult[0];

    // Fetch owner bio and experience
    const [profileResult] = await pool.query(
      'SELECT bio, experience_years FROM owner_profiles WHERE user_id = ?',
      [owner_id]
    );

    const ownerProfile = profileResult[0] || { bio: "No bio available", experience_years: null };

    // Count properties managed by this owner
    const [propertyResult] = await pool.query(
      'SELECT COUNT(*) AS propertyCount FROM properties WHERE owner_id = ?',
      [owner_id]
    );

    const propertyCount = propertyResult[0]?.propertyCount || 0;

    // Send full owner details including profile_image
    res.json({
      full_name: ownerInfo.full_name,
      email: ownerInfo.email,
      phone_number: ownerInfo.phone_number,
      profile_image: ownerInfo.profile_image || null, // Add profile_image here
      bio: ownerProfile.bio,
      experience_years: ownerProfile.experience_years,
      properties_managed: propertyCount,
    });

  } catch (error) {
    console.error('Error fetching owner details:', error);
    res.status(500).json({ message: 'Server error fetching owner details' });
  }
});


app.get('/api/investor-overview', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Total number of investors for this owner's non-failed projects and non-failed investments
    const [totalInvestorsResult] = await pool.query(`
      SELECT COUNT(DISTINCT i.investor_id) AS totalInvestors
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ?
        AND p.status != 'Failed'
        AND i.investment_status != 'failed'
    `, [ownerId]);
    const totalInvestors = totalInvestorsResult[0]?.totalInvestors || 0;

    // Total funds raised (excluding failed investments and failed projects)
    const [totalFundsResult] = await pool.query(`
      SELECT SUM(i.amount) AS totalFunds
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ?
        AND p.status != 'Failed'
        AND i.investment_status != 'failed'
    `, [ownerId]);
    const totalFunds = totalFundsResult[0]?.totalFunds || 0;

    // Investor distribution per project (excluding failed projects and failed investments)
    const [projects] = await pool.query(`
      SELECT 
        p.id, 
        p.name, 
        COUNT(DISTINCT i.investor_id) AS investorsCount, 
        IFNULL(SUM(i.amount), 0) AS fundsRaised
      FROM projects p
      LEFT JOIN investments i ON p.property_id = i.project_id AND i.investment_status != 'failed'
      WHERE p.owner_id = ? AND p.status != 'Failed'
      GROUP BY p.id, p.name
    `, [ownerId]);

    // Top 5 investors (excluding failed investments and failed projects)
    const [topInvestors] = await pool.query(`
      SELECT 
        u.full_name AS investorName, 
        SUM(i.amount) AS amount
      FROM users u
      JOIN investments i ON u.id = i.investor_id
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ?
        AND p.status != 'Failed'
        AND i.investment_status != 'failed'
      GROUP BY u.id, u.full_name
      ORDER BY amount DESC
      LIMIT 5
    `, [ownerId]);

    res.json({
      totalInvestors,
      totalFunds,
      projects,
      topInvestors
    });

  } catch (error) {
    console.error('Error fetching investor overview:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// API to get documents for a property
app.get("/api/documents/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Fetch document data from the database
    const query =
      "SELECT id, filename, file_url, description, tags, uploaded_at FROM documents WHERE propertyId = ?";
    const [documents] = await pool.query(query, [propertyId]);

    // Transform data for the frontend
    const files = documents.map((doc) => ({
      id: doc.id,
      name: doc.filename,
      url: doc.file_url,
      description: doc.description || "No description",
      tags: doc.tags || "No tags",
      uploadDate: doc.uploaded_at
        ? new Date(doc.uploaded_at).toISOString()
        : null,
    }));

    res.json(files);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ message: "Error fetching documents" });
  }
});

/* Upload a document for a specific property */
app.post("/api/documents/upload/:propertyId",upload.single("document"), authenticateJWT, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const { description, tags } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      // Ensure the directory for the property exists
      const propertyDir = `./uploads/${propertyId}`;
      if (!fs.existsSync(propertyDir)) {
        fs.mkdirSync(propertyDir, { recursive: true });
      }

      // Move file to the appropriate directory
      const filePath = path.join(propertyDir, req.file.originalname);
      await fs.promises.rename(req.file.path, filePath);

      // Construct file URL (assuming the server serves static files from /uploads)
      const fileUrl = `/uploads/${propertyId}/${req.file.originalname}`;

      // Format current timestamp for MySQL
      const uploadDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // Insert document metadata into the database
      const query = `
        INSERT INTO documents (propertyId, filename, file_url, description, tags, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      await pool.query(query, [
        propertyId,
        req.file.originalname,
        fileUrl,
        description,
        tags,
        uploadDate,
      ]);
      await logAccess(userId, ip, 'User added documents for a Property.');
      res.status(200).json({ message: "Document uploaded successfully" });
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Error uploading document" });
    }
  }
);

/*Delete a document for a specific property */
app.delete("/api/documents/delete/:propertyId/:fileId", authenticateJWT,async (req, res) => {
  try {
    const { propertyId, fileId } = req.params;
    const decodedFileId = decodeURIComponent(fileId);
    const filePath = path.join(__dirname, "uploads", propertyId, decodedFileId);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userId = req.user.id;

    // Check if file exists before deleting
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: `File not found: ${decodedFileId}` });
    }

    // Delete file asynchronously
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res.status(500).json({ message: "Error deleting document" });
      }

      // Delete from database
      const deleteQuery = "DELETE FROM documents WHERE id = ? AND propertyId = ?";
      await pool.query(deleteQuery, [fileId, propertyId]);
      await logAccess(userId, ip, 'User Deleted documents for a property.');
      res.status(200).json({ message: "Document deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Server error while deleting document" });
  }
});





// Serve the uploaded files (make sure to serve static files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Endpoint to get performance metrics for the owner
app.get('/api/performance-metrics', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [metrics] = await pool.query(`
      SELECT 
        COALESCE(SUM(i.amount), 0) AS totalFundsRaised,
        COALESCE(COUNT(DISTINCT i.investor_id), 0) AS numberOfInvestors,
        CASE 
          WHEN SUM(i.amount) = 0 THEN 0 
          ELSE SUM(i.amount * i.roi_percentage) / NULLIF(SUM(i.amount), 0) 
        END AS projectedROI,
        COALESCE(SUM(i.amount), 0) AS totalInvestments
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ? AND i.investment_status IN ('active', 'completed')
    `, [ownerId]);

    res.json(metrics[0]);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({ error: "Server error fetching metrics" });
  }
});



app.put("/api/projects/:id", authenticateJWT, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { name, status, fundingGoal, startDate, endDate } = req.body;

    // Validate input data
    if (!name || !status || !fundingGoal || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if project exists
    const [existingProject] = await pool.query(
      `SELECT id FROM projects WHERE id = ?`,
      [projectId]
    );

    if (existingProject.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Update the project
    const [updateResult] = await pool.query(
      `UPDATE projects 
       SET name = ?, status = ?, fundingGoal = ?, startDate = ?, endDate = ? 
       WHERE id = ?`,
      [name, status, fundingGoal, startDate, endDate, projectId]
    );

    // Check if any rows were updated
    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to update project" });
    }

    // Fetch the updated project data and return it
    const [updatedProject] = await pool.query(
      `SELECT * FROM projects WHERE id = ?`,
      [projectId]
    );

    res.json({
      message: "Project updated successfully",
      project: updatedProject[0], // Return the updated project data
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//manage returns
app.get("/api/returns", authenticateJWT, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        re.*, 
        re.status,
        re.amount,
        pr.name AS project_name
      FROM 
        return_earnings re
      JOIN 
        projects pr ON re.project_id = pr.id
      WHERE 
        re.owner_id = ?
      ORDER BY 
        re.created_at DESC
    `, [req.user.id]); // Correctly use the logged-in owner's ID

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching return earnings", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/returns", authenticateJWT, async (req, res) => {
  const { project_id, amount } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  if (!project_id || !amount) {
    return res.status(400).json({ message: "Project and amount are required" });
  }

  try {
    // Get project info
    const [[project]] = await pool.query(`
      SELECT endDate, name FROM projects WHERE id = ?
    `, [project_id]);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (new Date() < new Date(project.endDate)) {
      return res.status(400).json({ message: "Cannot submit returns before project ends." });
    }

    // Insert return earning
    await pool.query(`
      INSERT INTO return_earnings (project_id, amount, status, owner_id)
      VALUES (?, ?, 'pending', ?)
    `, [project_id, amount, userId]);

    // Get all admins
    const [admins] = await pool.query(`
      SELECT id, email FROM users WHERE role = 'admin'
    `);

    // Platform notifications to all admins
    for (const admin of admins) {
      await pool.query(`
        INSERT INTO notifications (user_id, message, type, read_status)
        VALUES (?, ?, 'return_posted', 'unread')
      `, [
        admin.id,
        `New return submitted for project "${project.name}".`
      ]);
    }

    // Platform notification for owner
    await pool.query(`
      INSERT INTO notifications (user_id, message, type, read_status)
      VALUES (?, ?, 'return_confirmation', 'unread')
    `, [
      userId,
      `You have successfully submitted returns for project "${project.name}" awaiting review.`
    ]);

    // Get owner's email
    const [[owner]] = await pool.query(`
      SELECT email FROM users WHERE id = ?
    `, [userId]);

   await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: owner.email,
  subject: `✅ Return Submission Received for "${project.name}"`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #2f855a; margin-bottom: 10px;">📥 Return Submission Received</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${owner.name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          We’ve successfully received your return submission for the project <strong>"${project.name}"</strong>.
        </p>
        <p style="font-size: 16px; color: #333;">
          Our team will now review the submission to ensure it meets all requirements. You’ll receive an update via email and in your dashboard once the review is complete.
        </p>
        <p style="font-size: 16px; color: #333;">
          If any additional information is required, we’ll reach out to you promptly.
        </p>
        <p style="font-size: 16px; color: #333; margin-top: 30px;">
          Thank you for managing your project with <strong>PropFundr</strong>.
        </p>
        <br/>
        <p style="font-size: 16px; color: #333;">
          Warm regards,<br/>
          <strong>The PropFundr Team</strong>
        </p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
});
    // Log access
    await logAccess(userId, ip, 'User Added Returns For a Project.');

    // Respond success
    res.status(201).json({ message: "Return entry added successfully!" });

  } catch (err) {
    console.error("❌ Error adding return earning", err);
    res.status(500).json({ message: "Failed to add return" });
  }
});


// GET: Projects ending soon for a specific owner
app.get("/api/projects-ending-soon", authenticateJWT, async (req, res) => {
  const ownerId = req.user.id;

  try {
    const [projects] = await pool.query(`
      SELECT id, name, endDate,
        DATEDIFF(endDate, NOW()) AS days_remaining
      FROM projects
      WHERE owner_id = ? AND DATEDIFF(endDate, NOW()) <= 14 AND DATEDIFF(endDate, NOW()) >= 0
      ORDER BY endDate ASC
    `, [ownerId]);

    res.json(projects);
  } catch (err) {
    console.error("❌ Failed to fetch projects ending soon:", err.message);
    res.status(500).json({ message: "Error fetching projects" });
  }
});


// Create milestone
app.post('/api/milestones', authenticateJWT, async (req, res) => {
  const { project_id, title, description, status, due_date } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  if (!project_id || !title || !description) {
    return res.status(400).json({ message: "⚠️ Missing required fields" });
  }

  try {
    // 1. Get project info (name + owner)
    const [[project]] = await pool.query(
      "SELECT name, owner_id FROM projects WHERE id = ?",
      [project_id]
    );

    if (!project) {
      return res.status(404).json({ message: "⚠️ Project not found" });
    }

    const projectName = project.name;

    // 2. Insert milestone
    const [result] = await pool.query(
      `INSERT INTO milestones (project_id, title, description, status, due_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [project_id, title, description, status, due_date]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: "❌ Failed to insert milestone." });
    }

    await logAccess(userId, ip, 'User Added a Milestone for a Project');
    const [[newMilestone]] = await pool.query("SELECT * FROM milestones WHERE id = ?", [result.insertId]);

    // 3. Notify all investors (platform + email)
  const [investors] = await pool.query(
  "SELECT DISTINCT investor_id FROM investments WHERE project_id = (SELECT property_id FROM projects WHERE id = ?) AND status = 'approved'",
  [project_id]
);

    for (const investor of investors) {
      const investorId = investor.investor_id;

      // Platform notification
      await insertNotification(
        investorId,
        `📍 A new milestone "${title}" has been added to project "${projectName}" you invested in.`,
        'milestone_update'
      );

      // Email notification
      const [[user]] = await pool.query(
        "SELECT email, full_name FROM users WHERE id = ?",
        [investorId]
      );

      if (user?.email) {
      await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: `📢 New Milestone Added to "${projectName}"`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #2b6cb0; margin-bottom: 10px;">📢 New Project Milestone</h2>
        <p style="font-size: 16px; color: #333;">Hello <strong>${user.full_name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          We’re excited to let you know that a new milestone has been added to the project you invested in: <strong>"${projectName}"</strong>.
        </p>
        <div style="background-color: #f1f5f9; border-left: 4px solid #2b6cb0; padding: 15px 20px; border-radius: 6px; margin-top: 20px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 15px;"><strong>Milestone Title:</strong> ${title}</p>
          <p style="margin: 8px 0; font-size: 15px;"><strong>Description:</strong> ${description}</p>
          <p style="margin: 0; font-size: 15px;"><strong>Due Date:</strong> ${due_date || 'Not specified'}</p>
        </div>
        <p style="font-size: 16px; color: #333;">
          Please log in to your <a href="http://localhost:3000" style="color: #2b6cb0; text-decoration: none;">dashboard</a> to view full details and track project progress.
        </p>
        <br/>
        <p style="font-size: 16px; color: #333;">Thank you for investing with us.</p>
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>
        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Do not reply directly to this email.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
});
      }
    }

    // 4. Notify all admins (platform only)
    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await insertNotification(
        admin.id,
        `📢 New milestone "${title}" was added to project "${projectName}" by Owner #${project.owner_id}.`,
        'milestone_admin'
      );
    }

    console.log(`✅ Milestone ${result.insertId} added. Investors + admins notified.`);

    res.json(newMilestone);
  } catch (err) {
    console.error("❌ Error creating milestone:", err);
    res.status(500).json({ error: "Failed to create milestone" });
  }
});




// Get Milestones for a Project
app.get('/api/milestones/:project_id', async (req, res) => {
  const { project_id } = req.params;

  if (!project_id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  try {
    const [milestones] = await pool.query(
      'SELECT id, title, description, COALESCE(status, "Pending") AS status, due_date FROM milestones WHERE project_id = ?',
      [project_id]
    );

    res.status(200).json(milestones.length > 0 ? milestones : []);
  } catch (err) {
    console.error('Error fetching milestones:', err.message);
    res.status(500).json({ message: 'Error fetching milestones', error: err.message });
  }
});


// Delete a Milestone
app.delete('/api/milestones/:id', authenticateJWT, async (req, res) => {
  const milestoneId = req.params.id;

  if (!milestoneId) {
    return res.status(400).json({ error: "Milestone ID is required" });
  }

  try {
    const [result] = await pool.query("DELETE FROM milestones WHERE id = ?", [milestoneId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Milestone not found" });
    }

    res.json({ message: "Milestone deleted successfully" });
  } catch (err) {
    console.error("Error deleting milestone:", err);
    res.status(500).json({ error: "Failed to delete milestone" });
  }
});


// Create Update with Notification Trigger
app.post('/api/updates', authenticateJWT, async (req, res) => {
  const { project_id, content } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  if (!project_id || !content) {
    return res.status(400).json({ message: "Project ID and content are required" });
  }

  try {
    // Get project details
    const [[project]] = await pool.query(
      "SELECT name, owner_id, property_id FROM projects WHERE id = ?",
      [project_id]
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectName = project.name;
    const projectPropertyId = project.property_id;

    // 1. Insert the update
    const [result] = await pool.query(
      "INSERT INTO updates (project_id, content, created_at) VALUES (?, ?, NOW())",
      [project_id, content]
    );

    const [[newUpdate]] = await pool.query(
      "SELECT * FROM updates WHERE id = ?", [result.insertId]
    );

    // 2. Notify Investors (platform + email)
    const [investors] = await pool.query(
      "SELECT DISTINCT investor_id FROM investments WHERE project_id = ? AND status = 'approved'",
      [projectPropertyId]
    );

    console.log("🧾 Investors to notify:", investors.length);

    for (const investor of investors) {
      const investorId = investor.investor_id;

      // Platform notification
      await insertNotification(
        investorId,
        `📝 New update posted for project "${projectName}": ${content}`,
        'project_update'
      );

      // Email
      const [[user]] = await pool.query(
        'SELECT email, full_name FROM users WHERE id = ?', [investorId]
      );

      if (user?.email) {
      const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: `📢 New Update on "${projectName}"`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #2b6cb0; margin-bottom: 10px;">📢 Project Update</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${user.full_name}</strong>,</p>
        <p style="font-size: 16px; color: #333;">
          A new update has just been posted for the project you're invested in: <strong>"${projectName}"</strong>.
        </p>

        <div style="background-color: #f1f5f9; border-left: 4px solid #2b6cb0; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <p style="font-size: 15px; color: #333; margin: 0;">${content}</p>
        </div>

        <p style="font-size: 16px; color: #333;">
          Please <a href="https://your-propfundr-domain.com/dashboard" style="color: #2b6cb0; text-decoration: none;">log in to your dashboard</a> to read the full update and explore any new changes.
        </p>
        <br/>
        <p style="font-size: 16px; color: #333;">Thank you for being a valued investor with PropFundr.</p>
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated notification from PropFundr. Please do not reply directly to this email.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to investor: ${user.email}`);
      }
    }

    // 3. Notify Admins (platform only)
    const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await insertNotification(
        admin.id,
        `📢 New update added to project "${projectName}" by Owner #${project.owner_id}.`,
        'admin_project_update'
      );
    }

    await logAccess(userId, ip, 'User posted an update for a project.');

    res.status(201).json({ message: "Update added successfully", update: newUpdate });
  } catch (err) {
    console.error("❌ Error adding update:", err);
    res.status(500).json({ message: "Error adding update", error: err.message });
  }
});


app.get("/api/updates/:projectId", async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [updates] = await pool.query(
      "SELECT id, content, created_at FROM updates WHERE project_id = ? ORDER BY created_at DESC",
      [projectId]
    );

    res.json(updates); // Ensure response contains created_at
  } catch (error) {
    console.error("Error fetching updates:", error);
    res.status(500).json({ message: "Failed to retrieve updates" });
  }
});

// Delete an Update
app.delete('/api/updates/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM updates WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Update not found" });
    }

    res.json({ message: "Update deleted successfully" });
  } catch (err) {
    console.error("Error deleting update:", err);
    res.status(500).json({ message: "Error deleting update", error: err.message });
  }
});


app.get("/api/project-financials/:propertyId", async (req, res) => {
  const { propertyId } = req.params;
  console.log("Requested propertyId:", propertyId);

  try {
    // Get total revenue, net profit, and ROI from investments
    const [financialSummary] = await pool.query(
      `SELECT 
         COALESCE(SUM(amount), 0) AS total_revenue,
         COALESCE(AVG(roi_percentage), 0) AS roi
       FROM investments 
       WHERE project_id = ?`, 
      [propertyId]
    );

    const totalRevenue = financialSummary[0].total_revenue;
    const roi = financialSummary[0].roi;
    const totalExpenses = 0; // Placeholder
    const netProfit = totalRevenue - totalExpenses;

    // 2. Fetch list of investors who invested in this project
    const [investments] = await pool.query(
      `SELECT 
         i.id,
         i.investor_id,
         i.amount,
         i.investment_date,
         u.full_name AS investor_name
       FROM investments i
       JOIN users u ON i.investor_id = u.id
       WHERE i.project_id = ?`,
      [propertyId]
    );

    // 3. Fetch payouts related to the project (from payouts table)
    const [payouts] = await pool.query(
      `SELECT 
         u.full_name AS recipient,
         p.amount,
         p.payout_date as date
       FROM payouts p
       JOIN investments i ON p.investment_id = i.id
       JOIN users u ON p.user_id = u.id
       WHERE i.project_id = ? AND p.status IN ('paid', 'processed', 'partially_paid')`,
      [propertyId]
    );

    const financialData = {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      roi,
      investments,
      payouts,
    };

    res.json(financialData);
  } catch (error) {
    console.error("Error fetching financial data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/generate-financial-report/:propertyId", async (req, res) => {
  const { propertyId } = req.params;
  console.log("Requested propertyId:", propertyId);

  try {
    // Query for financial summary
    const [summaryRows] = await pool.query(
      `SELECT 
           COALESCE(SUM(amount), 0) AS total_revenue,
           COALESCE(AVG(roi_percentage), 0) AS roi
       FROM investments i
       WHERE i.project_id = ?`,
      [propertyId]
    );

    // Ensure numerical values
    const totalRevenue = Number(summaryRows[0].total_revenue);

    // Query for investment records
    const [investmentRows] = await pool.query(
      `SELECT u.full_name AS investor_name, i.amount, i.investment_date 
       FROM investments i
       JOIN users u ON i.investor_id = u.id
       WHERE i.project_id = ?`,
      [propertyId]
    );

    // Query for payout records
    const [payoutRows] = await pool.query(
      `SELECT u.full_name AS recipient, p.amount, p.payout_date AS date 
       FROM payouts p
       JOIN investments i ON p.investment_id = i.id
       JOIN users u ON p.user_id = u.id
       WHERE i.project_id = ?`,
      [propertyId]
    );

    // Assemble data
    const financialData = {
      total_revenue: totalRevenue,
      investments: investmentRows.map(inv => ({
        ...inv,
        amount: Number(inv.amount)
      })),
      payouts: payoutRows.map(payout => ({
        ...payout,
        amount: Number(payout.amount)
      }))
    };

    // Generate PDF
    const doc = new PDFDocument();
    const filename = `financial_report_${propertyId}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // Title
    doc.fontSize(20).text("Financial Report", { align: "center" }).moveDown(1);

    // Overview
    doc.fontSize(14).text("Financial Overview", { underline: true }).moveDown(0.5);
    doc.fontSize(12).text(`Total Revenue: $${financialData.total_revenue.toFixed(2)}`);

    // Investments
    doc.fontSize(14).text("Investor Contributions", { underline: true }).moveDown(0.5);
    financialData.investments.forEach((inv, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${inv.investor_name} - $${inv.amount.toFixed(2)} (Invested on ${new Date(inv.investment_date).toLocaleDateString()})`
      );
    });
    doc.moveDown(1);

    // Payouts
    doc.fontSize(14).text("Payouts & Disbursements", { underline: true }).moveDown(0.5);
    financialData.payouts.forEach((payout, index) => {
      doc.fontSize(12).text(
        `${index + 1}. ${payout.recipient} - $${payout.amount.toFixed(2)} (Paid on ${new Date(payout.date).toLocaleDateString()})`
      );
    });

    doc.end();
  } catch (error) {
    console.error("Error generating financial report:", error);
    if (!res.headersSent) {
      res.status(500).send("Failed to generate financial report.");
    }
  }
});

app.get("/api/investments/property/:propertyId", authenticateJWT, async (req, res) => {
  const { propertyId } = req.params;
  console.log("Requested propertyId:", propertyId);

  if (isNaN(propertyId)) {
    console.log("Invalid property ID");
    return res.status(400).json({ message: "Invalid property ID" });
  }

  try {
    const [investmentResults] = await pool.query(
      `SELECT i.id, i.investor_id, i.amount, i.investment_date, 
              i.payout_status, i.status, i.roi_percentage, i.expected_return
       FROM investments i
       INNER JOIN projects p ON i.project_id = p.property_id
       WHERE p.property_id = ?`,
      [Number(propertyId)]
    );

    console.log("investmentResults:", investmentResults);

    if (investmentResults.length === 0) {
      return res.status(404).json({ message: "No investments found for this property" });
    }

    res.json(investmentResults);
  } catch (error) {
    console.error(`Error fetching investments for property ID ${propertyId}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get('/api/project-performance/:projectId', authenticateJWT, async (req, res) => {
  const { projectId } = req.params;

  try {
      const [result] = await pool.query(`
     SELECT 
    p.id AS project_id,
    p.name AS project_name,
    p.status,
    p.endDate AS expected_completion_date,  
    p.startDate,
    p.totalInvestment,
    IFNULL(SUM(i.amount), 0) AS total_funds_raised,
    COUNT(DISTINCT i.investor_id) AS num_investors,
    ROUND((IFNULL(SUM(i.amount), 0) / NULLIF(pr.funding_goal, 0)) * 100, 2) AS funding_percentage,  
    CASE 
        WHEN p.endDate < NOW() AND p.progress_percentage < 100
        THEN 'Delayed'
        ELSE 'On Track'
    END AS progress_status,
    CASE 
        WHEN (IFNULL(SUM(i.amount), 0) / NULLIF(pr.funding_goal, 0)) < 0.5  
        THEN 'Underfunded'
        WHEN p.endDate < NOW() 
        THEN 'At Risk'
        ELSE 'Stable'
    END AS risk_assessment
FROM projects p
LEFT JOIN investments i ON p.id = i.project_id
LEFT JOIN properties pr ON i.project_id = pr.propertyId  
WHERE p.id = '112'
GROUP BY p.id, pr.funding_goal
      `, [projectId]);

      if (result.length === 0) {
          return res.status(404).json({ message: "No performance data found for this project." });
      }

      res.json(result[0]);

  } catch (error) {
      console.error("Error fetching project performance:", error);
      res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/investments/property/:propertyId", authenticateJWT, async (req, res) => {
  const { propertyId } = req.params;

  if (isNaN(propertyId)) {
    return res.status(400).json({ message: "Invalid property ID" });
  }

  try {
    // First, get the corresponding project ID from the property ID
    const [projectResult] = await pool.query(
      `SELECT id FROM projects WHERE property_id = ?`,
      [Number(propertyId)]
    );

    if (projectResult.length === 0) {
      return res.status(404).json({ message: "No project found with this property ID" });
    }

    const projectId = projectResult[0].id;

    // Now get the investments for this project
    const [investmentResults] = await pool.query(
      `SELECT id, investor_id, amount, investment_date, 
              payout_status, status, roi_percentage, expected_return
       FROM investments
       WHERE project_id = ?`,
      [projectId]
    );

    if (investmentResults.length === 0) {
      return res.status(404).json({ message: "No investments found for this project" });
    }

    res.json(investmentResults);
  } catch (error) {
    console.error(`Error fetching investments for property ID ${propertyId}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});




// Routes for investordashboard
// Active Investments 
app.get('/api/active-investments', authenticateJWT, async (req, res) => {
  try {
    const investorId = req.user.id;

    const [investments] = await pool.query(`
      SELECT 
        i.id,
        COALESCE(p.name, 'No Project Name') AS project_title,
        i.amount,
        i.investment_status AS status,
        COALESCE((f.total_funded / NULLIF(f.funding_goal, 0)) * 100, 0) AS progress,  
        COALESCE(i.roi_percentage, 0) AS projectedROI, 
        COALESCE(i.amount + (i.amount * i.roi_percentage / 100), i.amount) AS expectedPayout,
        COALESCE(i.actual_return, NULL) AS actualReturn,
        COALESCE(GROUP_CONCAT(DISTINCT m.description ORDER BY m.created_at ASC SEPARATOR ', '), 'No milestones yet') AS milestones,
        (SELECT image_url FROM property_images WHERE property_images.propertyId = f.propertyId LIMIT 1) AS imageUrl,

        -- ✅ NEW FIELDS
        i.investment_date,
        pr.closing_date AS expectedCompletion,
        pr.category AS propertyType,
        pr.min_investment as investmentAmount,
        pr.location

      FROM investments i
      JOIN projects p ON i.project_id = p.property_id  
      LEFT JOIN funding_progress f ON p.property_id = f.propertyId  
     LEFT JOIN milestones m ON p.id = m.project_id
      LEFT JOIN properties pr ON f.propertyId = pr.propertyId

      WHERE i.investor_id = ? AND i.investment_status != 'failed'
      GROUP BY 
        i.id, p.name, i.amount, i.payout_status, i.roi_percentage, 
        f.total_funded, f.funding_goal, f.propertyId,
        i.investment_date, pr.closing_date, pr.category, pr.location
    `, [investorId]);

    const formattedInvestments = investments.map(inv => ({
      id: inv.id,
      property: inv.project_title,
      amount: `$${parseFloat(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      status: inv.status,
      progress: `${parseFloat(inv.progress).toFixed(2)}%`,
      milestones: inv.milestones ? inv.milestones.split(', ') : [],
      projectedROI: `${parseFloat(inv.projectedROI).toFixed(2)}%`,
      expectedPayout: `$${parseFloat(inv.expectedPayout).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      actualReturn: inv.actualReturn !== null
        ? `$${parseFloat(inv.actualReturn).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        : 'N/A',
      imageUrl: inv.imageUrl ? `http://192.168.100.30:5000${inv.imageUrl}` : null,

      // ✅ Add to frontend payload
      investmentDate: inv.investment_date ? inv.investment_date.toISOString().split('T')[0] : null,
      expectedCompletion: inv.expectedCompletion || null,
      investmentAmount: inv.investmentAmount || null,
      propertyType: inv.propertyType || null,
      location: inv.location || null,
    }));

    res.json(formattedInvestments);
  } catch (err) {
    console.error('Error fetching active investments:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//watchlist add
app.post('/api/watchlist/add', authenticateJWT, async (req, res) => {
  const { property_id } = req.body; 
  const user_id = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    await pool.query(
      'INSERT INTO watchlist (user_id, property_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE created_at = NOW()',
      [user_id, property_id]
    );

    const action = 'Added a property to watchlist';
    const message = `[${new Date().toLocaleString()}] ${action}`;
    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, log_details) VALUES (?, ?, ?)',
      [user_id, ip, message]
    );

    res.json({ message: 'Property added to watchlist' });
  } catch (error) {
    console.error('Error adding to watchlist or logging:', error);
    res.status(500).json({ error: 'Failed to add property to watchlist' });
  }
});


app.delete('/api/watchlist/remove/:property_id', authenticateJWT, async (req, res) => {
  const { property_id } = req.params;
  const user_id = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const [result] = await pool.query(
      'DELETE FROM watchlist WHERE user_id = ? AND property_id = ?',
      [user_id, parseInt(property_id)]
    );

    const action = 'Removed a property from watchlist';
    const message = `[${new Date().toLocaleString()}] ${action}`;
    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, log_details) VALUES (?, ?, ?)',
      [user_id, ip, message]
    );

    if (result.affectedRows > 0) {
      res.json({ message: 'Property removed from watchlist' });
    } else {
      res.json({ message: 'Property already removed or not found in watchlist' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to remove property from watchlist' });
  }
});


app.get('/api/watchlist', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        w.id, 
        w.property_id, 
        p.title, 
        p.location, 
        p.roi_percentage,
        p.funded_amount,
        p.funding_goal, 
        p.price,
        MIN(pi.image_url) AS propertyImage
      FROM watchlist w
      JOIN properties p ON w.property_id = p.propertyId
      LEFT JOIN property_images pi ON pi.propertyId = p.propertyId
      WHERE w.user_id = ?
      GROUP BY w.id, w.property_id, p.title, p.location, p.price
    `;

    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/opportunities/:id', async (req, res) => {
  const opportunityId = req.params.id
  try {
    const [rows] = await pool.query(
      `SELECT * FROM properties WHERE propertyId = ?`,
      [opportunityId]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Opportunity not found" })
    }

    res.json(rows[0])
  } catch (err) {
    console.error("Error fetching property:", err)
    res.status(500).json({ message: "Server error" })
  }
})






// API to get wallet balance
// Transacrtion handling
app.get('/api/transaction-history', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from JWT

    const [transactions] = await pool.query(
      `SELECT 
         id, 
         amount, 
         transaction_date AS date, 
         type, 
         status, 
         payment_method, 
         description, 
         project_id,
         fees_collected,
         transaction_ref
       FROM transactions
       WHERE user_id = ?
       ORDER BY transaction_date DESC`,
      [userId]
    );

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Transaction History Fetch Error:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

//payouts
app.get("/api/investor/payouts", authenticateJWT, async (req, res) => {
  const investorId = req.user.id;

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        p.amount,
        i.payout_status,
        p.method,
        p.transaction_ref,
        p.payout_date,
        i.project_id,
        pr.name AS project_name
      FROM payouts p
      JOIN investments i ON p.investment_id = i.id
      JOIN projects pr ON i.project_id = pr.property_id
      WHERE p.user_id = ?
      ORDER BY p.payout_date DESC
      `,
      [investorId]
    )

    res.json(rows)
  } catch (err) {
    console.error("❌ Failed to fetch payout history:", err)
    res.status(500).json({ message: "Error fetching payout history" })
  }
})


const checkInvestmentThreshold = async (projectId) => {
  try {
    const [[{ totalRaised = 0, fundingGoal = 1 }]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRaised, p.funding_goal 
       FROM investments i 
       JOIN projects p ON i.project_id = p.property_id 
       WHERE i.project_id = ?`,
      [projectId]
    );

    if (fundingGoal > 0 && (totalRaised / fundingGoal) * 100 >= 50) {
      const [investors] = await pool.query("SELECT DISTINCT user_id FROM investments WHERE project_id = ?", [projectId]);

      investors.forEach(({ user_id }) => {
        if (connectedUsers.has(user_id)) {
          connectedUsers.get(user_id).emit("notification", {
            message: `Project #${projectId} has reached 50% funding!`,
            type: "investment_threshold",
          });
        }
      });
    }
  } catch (error) {
    console.error("Error checking investment threshold:", error);
  }
};



app.post('/api/invest', authenticateJWT, async (req, res) => {
  const { amount, propertyId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
     const userId = req.user.id;

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized, please login.' });
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid investment amount.' });
  }

  console.log("Received propertyId:", propertyId);

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1️⃣ Fetch property details
    const [propertyRows] = await connection.query(
      `SELECT title, owner_id, COALESCE(funding_goal, 500000) AS funding_goal, 
              COALESCE(roi_percentage, 10) AS roi_percentage, closing_date
       FROM properties WHERE propertyId = ?`,
      [propertyId]
    );
    
    if (propertyRows.length === 0) {
      throw new Error('Property not found.');
    }

    const { 
      title: propertyTitle, owner_id: ownerId, funding_goal: fundingGoal, 
      roi_percentage: fetchedRoiPercentage, closing_date: closingDate 
    } = propertyRows[0];
    
    
   const existingRoiPercentage = Number(fetchedRoiPercentage) || 0;
    

    // 2️⃣ Fetch wallet balance
    const [walletRows] = await connection.query(
      'SELECT available_balance FROM wallets WHERE user_id = ?',
      [req.user.id]
    );

    const balance = walletRows.length > 0 ? parseFloat(walletRows[0].available_balance) : 0;
    
    // 3️⃣ Calculate investment fee (2% of investment amount)
    const investmentFee = parseFloat((amount * 0.02).toFixed(2));
    const totalDeduction = amount + investmentFee;

    if (totalDeduction > balance) {
      throw new Error('Insufficient balance.');
    }

    // 4️⃣ Deduct total amount from wallet
    await connection.query(
      'UPDATE wallets SET available_balance = available_balance - ? WHERE user_id = ?',
      [totalDeduction, req.user.id]
    );

    // 5️⃣ Record fee in platform_fees table
    const [transactionResult] = await connection.query(
      `INSERT INTO transactions (user_id, type, amount, transaction_date, project_id, status, payment_method, fees_collected) 
       VALUES (?, ?, ?, NOW(), ?, 'approved', 'platform', ?)`,
      [req.user.id, 'investment', amount, propertyId, investmentFee]
    );
    const transactionId = transactionResult.insertId;

    await connection.query(
      `INSERT INTO platform_fees (transaction_id, fee_type, fee_amount) 
       VALUES (?, 'investment_fee', ?)`,
      [transactionId, investmentFee]
    );

    // 6️⃣ Handle Investment Logic
    const [existingInvestment] = await connection.query(
      `SELECT id, amount, roi_percentage FROM investments 
       WHERE investor_id = ? AND project_id = ?`,
      [req.user.id, propertyId]
    );
    
    let investmentId;
    if (existingInvestment.length > 0) {
      const currentAmount = Number(existingInvestment[0].amount) || 0;
      const existingRoiPercentage = Number(existingInvestment[0].roi_percentage) || 0;
      const newAmount = currentAmount + Number(amount);
    
      const returnAmount = (newAmount + (newAmount * (existingRoiPercentage / 100))).toFixed(2);
      investmentId = existingInvestment[0].id;
    
      await connection.query(
        `UPDATE investments SET amount = ?, expected_return = ? WHERE id = ?`,
        [newAmount, returnAmount, investmentId]
      );
    } else {
      const amountNumber = Number(amount) || 0;
      const returnAmount = (amountNumber + (amountNumber * (existingRoiPercentage / 100))).toFixed(2);
    
      const [insertResult] = await connection.query(
        `INSERT INTO investments (investor_id, project_id, amount, investment_date, roi_percentage, expected_return) 
         VALUES (?, ?, ?, NOW(), ?, ?)`,
        [req.user.id, propertyId, amountNumber, existingRoiPercentage, returnAmount]
      );
      investmentId = insertResult.insertId;
    }
    

    // 7️⃣ Update funding progress
    const [totalInvestments] = await connection.query(
      `SELECT SUM(amount) AS total_invested FROM investments WHERE project_Id = ?`,
      [propertyId]
    );
    const actualAmountRaised = parseFloat(totalInvestments[0].total_invested) || 0;
    const progressPercentage = ((actualAmountRaised / fundingGoal) * 100).toFixed(2);

    await connection.query(
      `UPDATE funding_progress 
       SET amount_raised = ?, last_updated = NOW(), progress_percentage = ?, total_funded = ? 
       WHERE propertyId = ?`,
      [actualAmountRaised, progressPercentage, actualAmountRaised, propertyId]
    );

// 8️⃣ Handle Project Update
let [projectRows] = await connection.query(
  `SELECT id, status, IFNULL(totalInvestment, 0) AS totalInvestment, IFNULL(funding_goal, ?) AS projectFundingGoal 
   FROM projects WHERE property_id = ?`,
  [fundingGoal, propertyId]
);

let projectId;
let newTotalInvestment = 0;

if (projectRows.length === 0) {
  const [newProject] = await connection.query(
    `INSERT INTO projects (name, status, property_id, owner_id, totalInvestment, funding_goal) 
     VALUES (?, 'Active', ?, ?, ?, ?)`,
    [propertyTitle, propertyId, ownerId, amount, fundingGoal]
  );
  projectId = newProject.insertId;
} else {
  const { id, totalInvestment } = projectRows[0];
  projectId = id;
  // Ensure totalInvestment is updated correctly
  newTotalInvestment = (parseFloat(totalInvestment) || 0) + amount;

  await connection.query(
    `UPDATE projects SET totalInvestment = ? WHERE id = ?`,
    [newTotalInvestment, projectId]
  );
}
   // 🔥 Update Ownership Percentage in `investor_shares`
const ownershipPercentage = ((amount / fundingGoal) * 100).toFixed(2);

// Use SELECT * just to be safe in debugging
const [shareRows] = await connection.query(
  `SELECT id, investment_amount FROM investor_shares 
   WHERE investor_id = ? AND property_id = ?`,
  [req.user.id, propertyId]
);

if (shareRows.length > 0) {
  const currentAmount = parseFloat(shareRows[0].investment_amount) || 0;
  const newInvestmentAmount = currentAmount + parseFloat(amount);
  const newOwnershipPercentage = ((newInvestmentAmount / fundingGoal) * 100).toFixed(2);

  await connection.query(
    `UPDATE investor_shares 
     SET investment_amount = ?, ownership_percentage = ? 
     WHERE id = ?`,
    [newInvestmentAmount, newOwnershipPercentage, shareRows[0].id]
  );
} else {
  await connection.query(
    `INSERT INTO investor_shares (investor_id, property_id, investment_amount, ownership_percentage) 
     VALUES (?, ?, ?, ?)`,
    [req.user.id, propertyId, amount, ownershipPercentage]
  );
}

// Check if the investment is closed due to funding goal
const isFullyFunded = actualAmountRaised >= fundingGoal;

// Determine new investment status
const newInvestmentStatus = isFullyFunded ? 'closed' : 'open';

// Update funded amount and investment status
await connection.query(
  `UPDATE properties 
   SET funded_amount = ?, investment_status = ? 
   WHERE propertyId = ?`,
  [actualAmountRaised, newInvestmentStatus, propertyId]
);

await logAccess(userId, ip, 'User Successfully Invested on a project.');

    await connection.commit();

    // 🔔 Send Notifications
    await insertNotification(ownerId, `New investment of $${amount} made in your project "${propertyTitle}".`, "Investment Update");
    await insertNotification(req.user.id, `You have successfully invested $${amount} in "${propertyTitle}".`, "Investment Confirmation");

    // 🔔 Notify Admins for Large Investments
    if (amount > 10000) {
      const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');
      for (const admin of adminRows) {
        await insertNotification(admin.id, `Large investment alert: $${amount} invested in "${propertyTitle}".`, "Admin Alert");

        io.emit(`admin_notification_${admin.id}`, {
          message: `Large investment of $${amount} in "${propertyTitle}".`,
          type: "Admin Alert"
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Investment successful',
      newBalance: balance - totalDeduction,
      ownershipPercentage,
      investmentDetails: {
        investmentId,
        projectName: propertyTitle,
        investedAmount: amount,
        feeDeducted: investmentFee,
        remainingBalance: balance - totalDeduction,
      },
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Investment Error:', error);
    return res.status(500).json({ error: error.message || 'Investment failed' });
  } finally {
    if (connection) connection.release();
  }
});


//W
app.get('/api/portfolio', authenticateJWT, async (req, res) => {
  try {
    const investorId = req.user.id;
    console.log("🔍 Investor ID:", investorId);

    // Fetch portfolio stats (excluding failed investments)
    const [portfolioStats] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS totalInvested,
        COALESCE(SUM(actual_return), 0) AS totalReturns,
        COALESCE(SUM(amount + actual_return), 0) AS totalPortfolioValue
      FROM investments
      WHERE investor_id = ? AND investment_status != 'failed'
    `, [investorId]);

    // Fetch diversification (excluding failed)
    const [diversification] = await pool.query(`
      SELECT 
        COUNT(DISTINCT p.property_id) AS uniqueProperties
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE i.investor_id = ? AND i.investment_status != 'failed'
    `, [investorId]);

    // 🔎 Fetch KYC status for this user
    const [kycResult] = await pool.query(`
      SELECT status FROM kyc_submissions WHERE user_id = ?
    `, [investorId]);

    const kycStatus = kycResult.length > 0 ? kycResult[0].status : "not_submitted";

    const invested = portfolioStats[0]?.totalInvested || 0;
    const returns = portfolioStats[0]?.totalReturns || 0;
    const annualReturn = invested === 0 ? 0 : ((returns / invested) * 100).toFixed(2);
    const diversificationScore = Math.min((diversification[0]?.uniqueProperties || 0) * 10, 100); // Max 100

    const data = {
      ...portfolioStats[0],
      annualReturn,
      diversificationScore,
      kycStatus // 👈 include in response
    };
    console.log("📊 Clean Portfolio Data:", data);
    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching portfolio data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/investment-performance", authenticateJWT, async (req, res) => {
  try {
    const investorId = req.user.id; // Extract investor ID from the token
    console.log("Fetching investment data for investor ID:", investorId);

    // Fetch investment trends for this specific investor
    const trendsQuery = `
      SELECT DATE_FORMAT(investment_date, '%b') AS month, 
       SUM(amount) AS invested, 
       SUM(expected_return) AS returns
FROM investments
WHERE investor_id = ? AND investment_status != 'failed'
GROUP BY month
ORDER BY MIN(investment_date)

    `;
    const [trends] = await pool.query(trendsQuery, [investorId]);

    // Fetch ROI breakdown per project for this investor
    const roiQuery = `
     SELECT p.name AS name, COALESCE(SUM(i.expected_return), 0) AS value
FROM investments i
JOIN projects p ON i.project_id = p.property_id
WHERE i.investor_id = ? AND i.investment_status != 'failed'
GROUP BY p.name

    `;
    const [roiBreakdown] = await pool.query(roiQuery, [investorId]);
    console.log("ROI Breakdown Data:", roiBreakdown);

    // Fetch projects and their total investments for this investor
    const riskQuery = `
    SELECT p.name AS project, SUM(i.amount) AS total_investment
FROM projects p
JOIN investments i ON i.project_id = p.property_id
WHERE i.investor_id = ? AND p.status != 'Failed'
GROUP BY p.name

    `;
    const [riskLevels] = await pool.query(riskQuery, [investorId]);

    // Define risk assessment logic
    const assignRiskLevel = (investment) => {
      if (investment > 100000) return "High";
      if (investment > 50000) return "Medium";
      return "Low";
    };

    const riskColors = {
      Low: "green",
      Medium: "orange",
      High: "red",
    };

    const formattedRiskLevels = riskLevels.map((item) => {
      const riskLevel = assignRiskLevel(item.total_investment);
      return {
        project: item.project,
        risk: riskLevel,
        color: riskColors[riskLevel] || "gray",
      };
    });

    res.json({
      investmentTrendData: trends,
      roiBreakdownData: roiBreakdown,
      riskLevels: formattedRiskLevels,
    });
  } catch (error) {
    console.error("Error fetching investment performance data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// GET: Projects nearing end for a specific investor
app.get("/api/investor/projects-ending-soon", authenticateJWT, async (req, res) => {
  const investorId = req.user.id;

  try {
    const [projects] = await pool.query(`
      SELECT 
        pr.id AS project_id,
        pr.name AS project_name,
        pr.endDate,
        DATEDIFF(pr.endDate, NOW()) AS days_remaining,
        pr.status,
        COALESCE(SUM(i.amount), 0) AS invested_amount,
        COALESCE(MAX(re.status), 'not_submitted') AS return_status
      FROM investments i
      JOIN projects pr ON i.project_id = pr.property_id
      LEFT JOIN return_earnings re ON re.project_id = pr.property_id
      WHERE i.investor_id = ? 
        AND DATEDIFF(pr.endDate, NOW()) BETWEEN 0 AND 14
      GROUP BY pr.id, pr.name, pr.endDate, pr.status
      ORDER BY pr.endDate ASC
    `, [investorId]);

    res.json(projects);
  } catch (err) {
    console.error("❌ Error fetching nearing completion projects for investor:", err.message);
    res.status(500).json({ message: "Failed to load project info." });
  }
});


// Get notifications
app.get('/api/notifications', authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT id, message, read_status, created_at, updated_at, 
           COALESCE(type, 'General') AS type
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  const countQuery = `
    SELECT COUNT(*) AS unreadCount
    FROM notifications
    WHERE user_id = ? AND read_status = 'unread'
  `;

  try {
    const [notifications] = await pool.query(query, [userId]);
    const [[countResult]] = await pool.query(countQuery, [userId]); // Single row

    console.log("✅ Notifications:", notifications);
    console.log("✅ Unread Count:", countResult.unreadCount);

    res.json({
      notifications,
      unreadCount: countResult.unreadCount || 0,
    });
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// Mark all notifications as read
app.put('/api/notifications/mark-read', authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  const query = `
    UPDATE notifications
    SET read_status = 'read', updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND read_status = 'unread'
  `;

  try {
    const [result] = await pool.query(query, [userId]);

    if (result.affectedRows > 0) {
      console.log(`✅ ${result.affectedRows} notifications marked as read.`);
      res.json({ message: "Notifications marked as read", affectedRows: result.affectedRows });
    } else {
      res.json({ message: "No unread notifications found" });
    }
  } catch (err) {
    console.error("❌ Error updating notifications:", err);
    res.status(500).json({ message: "Failed to mark notifications as read" });
  }
});


// Wallet
app.get("/api/wallet", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // ✅ Fetch available balance
    const [wallet] = await pool.query(
      "SELECT COALESCE(available_balance, 0) AS available_balance, currency FROM wallets WHERE user_id = ?",
      [userId]
    );
    const availableBalance = wallet.length > 0 ? parseFloat(wallet[0].available_balance) : 0;
    const currency = wallet.length > 0 ? wallet[0].currency : "USD";

    // ✅ Total deposits
    const [deposits] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_deposits FROM transactions WHERE user_id = ? AND type = 'deposit' AND status = 'approved'",
      [userId]
    );
    const totalDeposits = parseFloat(deposits[0]?.total_deposits || 0);

    // ✅ Total *approved* earnings (actual returns) from non-failed investments
    const [earnings] = await pool.query(
      "SELECT COALESCE(SUM(COALESCE(actual_return, 0)), 0) AS total_earnings FROM investments WHERE investor_id = ? AND payout_status IN ('paid', 'partially_paid') AND investment_status != 'failed'",
      [userId]
    );
    const totalEarnings = parseFloat(earnings[0]?.total_earnings || 0);

    // ✅ Total *pending* earnings (expected returns) from non-failed investments
    const [pendingEarnings] = await pool.query(
      "SELECT COALESCE(SUM(expected_return), 0) AS total_pending_earnings FROM investments WHERE investor_id = ? AND payout_status = 'pending' AND investment_status != 'failed'",
      [userId]
    );
    const totalPendingEarnings = parseFloat(pendingEarnings[0]?.total_pending_earnings || 0);

    // ✅ Total approved investments
    const [investments] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_investments FROM transactions WHERE user_id = ? AND type = 'investment' AND status = 'approved'",
      [userId]
    );
    const totalInvestments = parseFloat(investments[0]?.total_investments || 0);

    // ✅ Total withdrawals
    const [withdrawals] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_withdrawals FROM transactions WHERE user_id = ? AND type = 'withdrawal' AND status = 'approved'",
      [userId]
    );
    const totalWithdrawals = parseFloat(withdrawals[0]?.total_withdrawals || 0);

    // ✅ Total fees
    const [fees] = await pool.query(
      "SELECT COALESCE(SUM(fees_collected), 0) AS total_fees FROM transactions WHERE user_id = ? AND status = 'approved'",
      [userId]
    );
    const totalFees = parseFloat(fees[0]?.total_fees || 0);

    // ✅ Return wallet summary
    res.json({
      availableBalance: availableBalance.toFixed(2),
      totalInvestments: totalInvestments.toFixed(2),
      earnings: totalEarnings.toFixed(2),
      pendingEarnings: totalPendingEarnings.toFixed(2),
      withdrawals: totalWithdrawals.toFixed(2),
      deposits: totalDeposits.toFixed(2),
      fees: totalFees.toFixed(2),
      currency
    });

  } catch (error) {
    console.error("❌ Error fetching wallet:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/wallet/withdraw", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { amount, paypalEmail } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!amount || amount <= 0 || isNaN(amount) || !paypalEmail) {
    return res.status(400).json({ message: "Invalid withdrawal request or missing OTP" });
  }

  const amountNum = parseFloat(amount);
  const withdrawalFeeRate = 0.02; // 2%
  const feeAmount = parseFloat((amountNum * withdrawalFeeRate).toFixed(2));
  const netWithdrawal = parseFloat((amountNum - feeAmount).toFixed(2));

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
        // ✅ 1.Get Withdrawable Balance using accurate payout-based logic
    const [[wallet]] = await pool.query(
      "SELECT available_balance FROM wallets WHERE user_id = ?", [userId]
    );
    if (!wallet) throw new Error("Wallet not found");
    

    const availableBalance = parseFloat(wallet.available_balance || 0);
    
    const withdrawableBalance = availableBalance;

    // ✅ 2. Check if user has enough balance
    if (withdrawableBalance < amountNum) {
      throw new Error("Insufficient withdrawable balance.");
    }

    // ✅ 3. Deduct balance from user's wallet
await pool.query(
  "UPDATE wallets SET available_balance = available_balance - ? WHERE user_id = ?",
  [amountNum, userId]
);
    // ✅ 4. Insert withdrawal transaction (pending)
    const [withdrawalTransaction] = await pool.query(
      `INSERT INTO transactions 
        (user_id, type, amount, status, fees_collected, transaction_date, payment_method, paypal_email) 
       VALUES (?, 'withdrawal', ?, 'pending', ?, NOW(), 'PayPal', ?)`,
      [userId, netWithdrawal, feeAmount, paypalEmail]
    );

    const transactionId = withdrawalTransaction.insertId;

    // ✅ 5. Record the platform fee
    await pool.query(
      "INSERT INTO platform_fees (transaction_id, fee_type, fee_amount, created_at) VALUES (?, 'withdrawal_fee', ?, NOW())",
      [transactionId, feeAmount]
    );
    await logAccess(userId, ip, 'User Requested for Withdrawal.');
    await connection.commit();

       // ✅ Notify Admins for Approval
       const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');
       if (adminRows.length > 0) {
         for (let admin of adminRows) {
           await insertNotification(
             admin.id,
             `User (ID: ${userId}) requested a withdrawal of $${netWithdrawal}. Approval required.`,
             "Admin Alert"
           );
         }
         console.log(`📩 Admins notified about withdrawal request.`);
       } else {
         console.log("⚠️ No admins found to notify.");
       }

       // ✅ Fetch investor email and name for notif
const [userDetails] = await pool.query(
  "SELECT email, full_name FROM users WHERE id = ?",
  [userId]
);

if (userDetails.length > 0) {
  const { email, full_name } = userDetails[0];

  const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "💸 Withdrawal Request Received",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #2b6cb0; margin-bottom: 10px;">💸 Withdrawal Request Submitted</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${full_name}</strong>,</p>

        <p style="font-size: 16px; color: #333;">
          We’ve received your withdrawal request of <strong>$${netWithdrawal}</strong>. It is now pending review by our team.
        </p>

        <div style="background-color: #f1f5f9; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-bottom: 10px; color: #2b6cb0;">🔍 Withdrawal Details:</h4>
          <ul style="list-style: none; padding-left: 0; font-size: 15px; color: #333;">
            <li><strong>Requested Amount:</strong> $${amountNum}</li>
            <li><strong>Withdrawal Fee:</strong> $${feeAmount}</li>
            <li><strong>Net Amount:</strong> $${netWithdrawal}</li>
            <li><strong>PayPal Email:</strong> ${paypalEmail}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333;">You will receive a confirmation email once your request has been reviewed and processed.</p>
        <p style="font-size: 16px; color: #333;">Thank you for choosing <strong>PropFundr</strong>.</p>
        
        <br/>
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply directly to this email.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
  await transporter.sendMail(mailOptions);
  console.log(`📧 Withdrawal email sent to ${email}`);
} else {
  console.warn(`⚠️ Email not sent: User ID ${userId} not found in users table.`);
}
    res.json({
      message: "Withdrawal request submitted. Awaiting admin approval.",
      netWithdrawal,
      feeAmount,
      requestId: transactionId,
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Withdrawal Error:", error);
    res.status(500).json({ error: error.message || "Withdrawal request failed" });
  } finally {
    if (connection) connection.release();
  }
});

// 🟢 GET Withdrawable Balance (Available Wallet Funds)
app.get("/api/wallet/withdrawable-balance", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    // ✅ Fetch available wallet balance
    const [wallet] = await pool.query(
      "SELECT COALESCE(available_balance, 0) AS withdrawable_balance FROM wallets WHERE user_id =? ", 
      [userId]
    );

    if (!wallet.length) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({ withdrawable_balance: Number(wallet[0].withdrawable_balance) });
  } catch (error) {
    console.error("Error fetching withdrawable balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// Deposit handling
const PAYPAL_CLIENT_ID = "AZszCrvyY6BL14JHV6X1SU4QmaKDh9_jTvM78ByDmHB4ZwxHz5vNOLhfPS312RphE3uKURykiSzS2WTI";
const PAYPAL_SECRET = "ENS3nD_vAz4B3r6t6y5bI1PF3arvi0SX4AcOxFoUtZaH5Rw7gYkgGUtH8NUeoVEUY7JcCnBMlSLKKC-C";
const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Change to live PayPal API in production

async function generatePayPalAccessToken() {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString("base64");
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("❌ Failed to generate PayPal access token:", error.message);
    throw new Error("PayPal authentication error.");
  }
}

// ✅ Create PayPal Order
app.post("/api/wallet/deposit/paypal", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;
  

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid deposit amount" });
  }

  try {
    const accessToken = await generatePayPalAccessToken();

    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
        },
      ],
    };

    const response = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, orderData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    res.json({ orderId: response.data.id });
  } catch (error) {
    console.error("❌ PayPal Order Creation Error:", error);
    res.status(500).json({ message: "Failed to create PayPal order" });
  }
});


// ✅ Capture PayPal Payment
app.post("/api/wallet/deposit/capture", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!orderId) {
    return res.status(400).json({ message: "Missing PayPal order ID." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Generate PayPal access token
    const accessToken = await generatePayPalAccessToken();

    // Capture payment from PayPal
    const response = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract captured amount
    const purchaseUnit = response?.data?.purchase_units?.[0];
    const captureDetails = purchaseUnit?.payments?.captures?.[0];

    if (!captureDetails) {
      throw new Error("No capture details found in PayPal response.");
    }

    const capturedAmount = parseFloat(captureDetails.amount.value);
    const transactionId = captureDetails.id;

    if (isNaN(capturedAmount) || capturedAmount <= 0) {
      throw new Error("Invalid captured amount from PayPal.");
    }

    // Prevent duplicate transactions
    const [existingTransaction] = await connection.query(
      "SELECT id FROM transactions WHERE transaction_ref = ? AND user_id = ?",
      [transactionId, userId]
    );

    if (existingTransaction.length > 0) {
      throw new Error("Duplicate transaction detected.");
    }


// Check if wallet exists
const [walletRows] = await connection.query(
  "SELECT id FROM wallets WHERE user_id = ?",
  [userId]
);

if (walletRows.length > 0) {
  // Wallet exists → update balance
  await connection.query(
    "UPDATE wallets SET available_balance = available_balance + ? WHERE user_id = ?",
    [capturedAmount, userId]
  );
} else {
  // Wallet does NOT exist → insert new wallet with captured amount
  await connection.query(
    "INSERT INTO wallets (user_id, available_balance) VALUES (?, ?)",
    [userId, capturedAmount]
  );
}

    // ✅ Insert Transaction Record
    await connection.query(
      "INSERT INTO transactions (user_id, type, amount, status, payment_method, transaction_ref) VALUES (?, 'deposit', ?, 'approved', 'paypal', ?)",
      [userId, capturedAmount, transactionId]
    );

    // Modify the response to include the user's role
const [userRow] = await connection.query("SELECT role FROM users WHERE id = ?", [userId]);
const userRole = userRow.length > 0 ? userRow[0].role : "investor"; // Default to investor if not found

await logAccess(userId, ip, 'User successfully deposited funds.');

    // ✅ Notify Admins
    const [adminRows] = await pool.query(
      'SELECT id FROM users WHERE role = "admin"'
    );

    if (adminRows.length > 0) {
      for (let admin of adminRows) {
        await insertNotification(
          admin.id,
          `User (ID: ${userId}) deposited $${capturedAmount} via PayPal.`,
          "Admin Alert"
        );
      }
      console.log("📩 Admins notified about deposit.");
    } else {
      console.log("⚠️ No admins found to notify.");
    }

// ✅ Notify Depositing User
await insertNotification(
  userId,
  `Your deposit of $${capturedAmount.toLocaleString()} via PayPal was successful.`,
  "Deposit Success"
);

// ✅ Get user email and send them notifications
const [userInfo] = await connection.query("SELECT email FROM users WHERE id = ?", [userId]);
const userEmail = userInfo.length > 0 ? userInfo[0].email : null;

if (userEmail) {
  const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: "✅ Deposit Confirmation – PropFundr",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #2e7d32; margin-bottom: 10px;">💰 Deposit Successful</h2>
        <p style="font-size: 16px; color: #333;">Hi there,</p>

        <p style="font-size: 16px; color: #333;">
          We’ve successfully processed your deposit of <strong>$${capturedAmount.toLocaleString()}</strong> via PayPal.
        </p>

        <div style="background-color: #f1f5f9; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin-bottom: 10px; color: #2b6cb0;">🔍 Transaction Details:</h4>
          <ul style="list-style: none; padding-left: 0; font-size: 15px; color: #333;">
            <li><strong>Amount:</strong> $${capturedAmount.toLocaleString()}</li>
            <li><strong>Transaction ID:</strong> ${transactionId}</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #333;">
          You can view this deposit in your wallet history from your dashboard.
        </p>

        <br/>
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply directly to this email.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email to user:", error);
    } else {
      console.log("📧 Deposit confirmation email sent:", info.response);
    }
  });
}
    // ✅ Commit transaction
    await connection.commit();

    res.json({
      message: "Deposit successful",
      capturedAmount,
      transactionId,
      role: userRole,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("⚠️ PayPal Capture Error:", error.message);
    res.status(500).json({ message: error.message || "Payment capture failed." });
  } finally {
    if (connection) connection.release();
  }
});



app.get("/api/transactions/recent", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const [transactions] = await pool.query(
      `SELECT id, type, amount, DATE_FORMAT(transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date, 
              status, payment_method, description 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC 
       LIMIT 5`,
      [userId]
    );
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//verification
// Send OTP for withdrawal verification
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
};
({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpToEmail = async (email, otp) => {
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px; background-color: #ffffff;">
      <h2 style="text-align: center; color: #2c3e50;">🔐 PropFundr Withdrawal Verification</h2>
      <p>Dear Investor,</p>
      <p>You requested a withdrawal from your PropFundr wallet. To proceed, please use the One-Time Password (OTP) below to verify your request:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 32px; font-weight: bold; color: #2c3e50; padding: 10px 20px; background: #f5f5f5; display: inline-block; border-radius: 8px;">
          ${otp}
        </div>
      </div>
      
      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>

      <p>If you did not request this, please ignore this email or contact support immediately.</p>

      <p style="margin-top: 30px;">Thank you,<br>The PropFundr Team</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PropFundr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your PropFundr Withdrawal OTP",
      html: htmlTemplate,
    });
    console.log(`📨 OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
  }
};
app.post("/api/withdraw/send-otp", authenticateJWT, async (req, res) => {
  const userId = req.user.id;

  try {
    const otp = generateOTP(); // Ensure this function returns a 6-digit OTP

    await pool.query("UPDATE users SET otp = ? WHERE id = ?", [otp, userId]);

    // Send OTP via email
    sendOtpToEmail(req.user.email, otp); // Ensure this function is implemented correctly

    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});


app.post("/api/withdraw/verify-otp", authenticateJWT, async (req, res) => {
  const { otp } = req.body;
  const userId = req.user.id;

  try {
    // Fetch the user's OTP from the database
    const [rows] = await pool.query("SELECT otp FROM users WHERE id = ?", [userId]);

    if (!rows.length || rows[0].otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Clear OTP after verification
    await pool.query("UPDATE users SET otp = NULL WHERE id = ?", [userId]);

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP." });
  }
});

//cancelwithdrawal request for all users
// Function to send email notification to the user
const sendEmailNotification = async (userEmail, totalRefund) => {
  const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: userEmail,
  subject: "⚠️ Withdrawal Request Canceled – PropFundr",
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #c62828; margin-bottom: 10px;">⚠️ Withdrawal Canceled</h2>
        <p style="font-size: 16px; color: #333;">Hello,</p>

        <p style="font-size: 16px; color: #333;">
          Your withdrawal request of <strong>$${totalRefund}</strong> has been successfully <strong>canceled</strong>, and the full amount has been returned to your wallet balance.
        </p>

        <div style="background-color: #fef3c7; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #8a6d3b;">
            💡 If this cancellation was unintentional or you need assistance, feel free to contact our support team from your dashboard.
          </p>
        </div>

        <p style="font-size: 16px; color: #333;">
          You can initiate a new withdrawal at any time from your wallet page.
        </p>

        <br/>
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply directly to this email.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
  try {
    await transporter.sendMail(mailOptions);
    console.log('📩 Email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

app.post("/api/wallet/cancel-withdrawal", authenticateJWT, async (req, res) => {
  const { transactionId } = req.body;
  const userId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ✅ 1. Fetch the transaction details (must belong to this user and be pending)
    const [[transaction]] = await connection.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ? AND status = "pending"',
      [transactionId, userId]
    );

    if (!transaction) {
      throw new Error("Transaction not found or already processed.");
    }

    const { amount, fees_collected } = transaction;
    const totalRefund = parseFloat(amount) + parseFloat(fees_collected);

    // ✅ 2. Refund the amount + fee to wallet
    await connection.query(
      "UPDATE wallets SET available_balance = available_balance + ? WHERE user_id = ?",
      [totalRefund, userId]
    );

    // ✅ 3. Delete the transaction
    await connection.query("DELETE FROM transactions WHERE id = ?", [transactionId]);

    // ✅ 4. Delete related platform fee
    await connection.query("DELETE FROM platform_fees WHERE transaction_id = ?", [transactionId]);

    // ✅ 5. Log activity
    await logAccess(userId, ip, "User cancelled a withdrawal request");

    // ✅ Notify Admins
    const [adminRows] = await pool.query(
      'SELECT id FROM users WHERE role = "admin"'
    );

    if (adminRows.length > 0) {
      for (let admin of adminRows) {
        await insertNotification(
          admin.id,
          `User (ID: ${userId}) cancelled a withdrawal request worth $${totalRefund}.`,
          "Admin Alert"
        );
      }
      console.log("📩 Admins notified about deposit.");
    } else {
      console.log("⚠️ No admins found to notify.");
    }

    // ✅ Fetch the user's email (assuming you store this in the transaction or you can query it directly)
    const [[user]] = await connection.query(
      'SELECT email FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      throw new Error("User email not found.");
    }
    const userEmail = user.email;

    // ✅ Send email notification to the user
    await sendEmailNotification(userEmail, totalRefund);

    await connection.commit();

    return res.json({
      message: "Withdrawal cancelled. Funds restored to your wallet.",
      refundedAmount: totalRefund
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Withdrawal Cancel Error:", error);
    res.status(500).json({ message: "Failed to cancel withdrawal. Try again." });
  } finally {
    if (connection) connection.release();
  }
});


///////////////OWNER WALLET
// Owner Wallet - Returns earnings & actual wallet balance (only when project is fully funded)
app.get("/api/owner-wallet", authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;
    console.log("Fetching wallet for owner ID:", ownerId);

 // 🔒 Escrowed funds: approved & active investments in active or funded projects,
// excluding those that already had a fund_release transaction
const [escrowRows] = await pool.query(
  `SELECT
    COALESCE(SUM(i.amount), 0) AS escrowedFunds
  FROM investments i
  JOIN projects p ON i.project_id = p.property_id
  WHERE p.owner_id = ?
    AND i.status = 'approved'
    AND i.investment_status = 'active'
    AND (
      p.status = 'Active'
      OR (
        p.status = 'Funded'
        AND NOT EXISTS (
          SELECT 1
          FROM transactions t
          WHERE t.project_id = p.id
            AND t.type = 'fund_release'
        )
      )
    )`,
  [ownerId]
);

    // 🕒 Investments awaiting approval
    const [investmentRows] = await pool.query(
      `SELECT 
          SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END) AS pendingInvestmentEarnings
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ?`, 
      [ownerId]
    );


    // ✅ Investment funds released to owner's wallet
    const [releasedRows] = await pool.query(
      `SELECT 
          COALESCE(SUM(amount), 0) AS releasedFunds
      FROM transactions
      WHERE user_id = ? AND type = 'fund_release'`, 
      [ownerId]
    );

    // 🧮 Calculations
    const escrowedFunds = parseFloat(escrowRows[0].escrowedFunds || 0);
    const pendingInvestmentEarnings = parseFloat(investmentRows[0].pendingInvestmentEarnings || 0);
    const releasedFunds = parseFloat(releasedRows[0].releasedFunds || 0);
    const pledgeReleasedToOwner = releasedFunds;

    // 🎯 Owner's actual wallet balance
    const [walletRow] = await pool.query(
      `SELECT available_balance FROM wallets WHERE user_id = ?`,
      [ownerId]
    );
    const availableWalletBalance = parseFloat(walletRow[0]?.available_balance || 0);
    
    // 🏗 Total Pledged = only escrowed funds (investors’ commitments)
    const totalPledged = escrowedFunds;

    // ✅ Return wallet structure
    res.json({
      availableWalletBalance,
      escrowedFunds,
      awaitingApproval: pendingInvestmentEarnings,
      totalPledged,
      pledgeReleasedToOwner,
    });

  } catch (error) {
    console.error("Error fetching owner wallet:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Get wallet transactions with optional search filter
app.get("/api/wallet/transactions", authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [transactions] = await pool.query(
      `SELECT 
           id,
          type, 
          amount, 
          status, 
          payment_method, 
          transaction_date 
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC 
       LIMIT 10`,
       [ownerId]
    );

    console.log("Transactions fetched:", transactions);

    res.json(transactions);
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get platform fees
app.get("/api/wallet/fees", authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    const [feesRows] = await pool.query(
      `SELECT 
          SUM(CASE WHEN fee_type = 'listing_fee' THEN fee_amount ELSE 0 END) AS listingFeesPaid,
          SUM(CASE WHEN fee_type = 'investment_fee' OR fee_type = 'withdrawal_fee' THEN fee_amount ELSE 0 END) AS transactionFeesPaid
      FROM platform_fees
      WHERE transaction_id IN (SELECT id FROM transactions WHERE user_id = ?)`, 
      [ownerId]
    );

    res.json({
      listingFeesPaid: parseFloat(feesRows[0].listingFeesPaid || 0.0),
      transactionFeesPaid: parseFloat(feesRows[0].transactionFeesPaid || 0.0),
    });

  } catch (error) {
    console.error("Error fetching platform fees:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//withdrwal request
// Function to send email notification to the user
const sendNotificationEm = async (userEmail, withdrawalAmount, transactionId) => {
 const mailOptions = {
    from: `"PropFundr" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "💸 Withdrawal Request Received – PropFundr",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f9fafb; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <h2 style="color: #1e88e5; margin-bottom: 10px;">💸 Withdrawal Submitted</h2>
          <p style="font-size: 16px; color: #333;">Hello,</p>

          <p style="font-size: 16px; color: #333;">
            We've received your withdrawal request of <strong>$${withdrawalAmount}</strong>. It is now <strong>pending approval</strong>.
          </p>

          <p style="font-size: 15px; color: #555;">
            <strong>Transaction ID:</strong> ${transactionId}
          </p>

          <div style="background-color: #e3f2fd; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 15px; color: #0d47a1;">
              ⏳ Withdrawals are typically reviewed within 24–48 hours. You'll receive another email once it's approved.
            </p>
          </div>

          <p style="font-size: 16px; color: #333;">
            Thank you for using PropFundr.
          </p>

          <br/>
          <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

          <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            This is an automated message. Please do not reply directly to this email.<br/>
            © ${new Date().getFullYear()} PropFundr. All rights reserved.
          </p>
        </div>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log('📩 Email sent to:', userEmail);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};
app.post("/api/ownwallet/withdraw", authenticateJWT, async (req, res) => {
  try {
    const { amount, paypalEmail } = req.body;
    const userId = req.user.id; // Get user ID from token
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


    if (!amount || amount <= 0 || isNaN(amount)) {
      return res.status(400).json({ message: "Invalid withdrawal amount." });
    }

    if (!paypalEmail) {
      return res.status(400).json({ message: "PayPal email is required." });
    }

    // ✅ Check if user has enough balance
    const [balanceResult] = await pool.query(
      "SELECT available_balance FROM wallets WHERE user_id = ?",
      [userId]
    );

    if (!balanceResult.length || balanceResult[0].available_balance < amount) {
      return res.status(400).json({ message: "Insufficient balance." });
    }

    // ✅ Platform Fee (5%) Calculation
    const platformFeePercentage = 5;
    const platformFee = parseFloat(((platformFeePercentage / 100) * amount).toFixed(2));
    const finalWithdrawalAmount = parseFloat((amount - platformFee).toFixed(2));

    if (finalWithdrawalAmount <= 0) {
      return res.status(400).json({ message: "Withdrawal amount too low after fees." });
    }

    // ✅ Deduct balance from user's wallet (money stays in system until admin approves)
    await pool.query(
      "UPDATE wallets SET available_balance = available_balance - ? WHERE user_id = ?",
      [amount, userId]
    );

    // ✅ Insert withdrawal request into transactions table with "pending" status
    const [withdrawResult] = await pool.query(
      `INSERT INTO transactions (user_id, type, amount, payment_method, paypal_email, fees_collected, status,transaction_date) 
       VALUES (?, 'withdrawal', ?, 'paypal', ?, ?, 'pending', NOW())`,
      [userId, finalWithdrawalAmount, paypalEmail, platformFee]
    );
    

    const transactionId = withdrawResult.insertId;

    // Record Platform Fee
    await pool.query(
      "INSERT INTO platform_fees (transaction_id, fee_type, fee_amount, created_at) VALUES (?, 'withdrawal_fee', ?, NOW())",
      [transactionId, platformFee]
    );

    await logAccess(userId, ip, 'User requested withdrawal.');
    // ✅ Notify Admins for Approval
    const [adminRows] = await pool.query('SELECT id FROM users WHERE role = "admin"');
    if (adminRows.length > 0) {
      for (let admin of adminRows) {
        await insertNotification(
          admin.id,
          `User (ID: ${userId}) requested a withdrawal of $${finalWithdrawalAmount}. Approval required.`,
          "Admin Alert"
        );
      }
      console.log(`📩 Admins notified about withdrawal request.`);
    } else {
      console.log("⚠️ No admins found to notify.");
    }

        // ✅ Send email notification to the user
    const [userResult] = await pool.query(
      "SELECT email FROM users WHERE id = ?",
      [userId]
    );

    if (!userResult.length) {
      console.error("❌ User not found for email notification.");
    } else {
      const userEmail = userResult[0].email;
      await sendNotificationEm(userEmail, finalWithdrawalAmount, transactionId);
    }

    res.json({
      message: "Withdrawal request submitted and pending approval.",
      withdrawalAmount: finalWithdrawalAmount,
      platformFee: platformFee,
      feePercentage: platformFeePercentage,
      transactionId: transactionId,
    });

  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({ message: "Server error, please try again later." });
  }
});


app.get('/api/wallet/investments', async (req, res) => {
  try {
      const sql = `
          SELECT 
              p.id AS projectId, 
              p.name AS projectName, 
              COUNT(i.id) AS investorsCount, 
              COALESCE(SUM(i.amount), 0) AS totalFunds
          FROM projects p
          LEFT JOIN investments i ON p.id = i.project_id
          GROUP BY p.id, p.name
      `;

      const [rows] = await pool.query(sql);
      res.json(rows);
  } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ error: "Server error" });
  }

});

app.get("/api/kycstatus", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  console.log("userId:", userId); // 👈 LOG THIS

  const [result] = await pool.query(
    "SELECT status FROM kyc_submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

  const status = result.length ? result[0].status : "none";
  res.json({ status });
});



// Middleware to verify token and role
function verifyAdmin(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied.' });
  }

  // Verify the token
  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    // Check if the role is 'admin'
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Store user data in request for future use
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
}


// Get all messages
app.get('/api/messages/owner/:investorId', authenticateJWT, async (req, res) => {
  const ownerId = req.user.id; // Owner's ID from authenticated user
  const investorId = req.params.investorId; // Investor's ID from URL

  try {
    const [results] = await pool.query(
      `SELECT messages.id, messages.message, messages.sent_at, 
              sender.full_name AS sender_name, sender.role AS sender_role,
              receiver.full_name AS receiver_name, receiver.role AS receiver_role
       FROM messages
       LEFT JOIN users sender ON messages.sender_id = sender.id
       LEFT JOIN users receiver ON messages.receiver_id = receiver.id
       WHERE (messages.sender_id = ? AND messages.receiver_id = ?) 
          OR (messages.sender_id = ? AND messages.receiver_id = ?)
       ORDER BY messages.sent_at ASC`,
      [ownerId, investorId, investorId, ownerId]
    );

    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});



app.get('/api/messages/:investorId', authenticateJWT, async (req, res) => {
  const investorId = req.params.investorId;
  if (!investorId) {
      return res.status(400).json({ error: 'Investor ID is required' });
  }

  try {
      const [messages] = await pool.query(
          'SELECT * FROM messages WHERE sender_id = ? OR receiver_id = ? ORDER BY sent_at ASC', // Fixed column name
          [investorId, investorId]
      );
      res.json(messages);
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/messages/bulk', authenticateJWT, async (req, res) => {
  const { message } = req.body;
  const senderId = req.user?.id; // Get sender from authenticated request

  if (!senderId || !message) {
      return res.status(400).json({ error: 'Sender ID and message are required' });
  }

  try {
      const [result] = await pool.query(`
          INSERT INTO messages (sender_id, receiver_id, message)
          SELECT ?, id, ? FROM users WHERE role = 'investor'
      `, [senderId, message]);

      res.json({ success: true, message: 'Bulk message sent to all investors' });
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/investors', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id; // Get the logged-in owner's ID

    const [results] = await pool.query(
      `SELECT DISTINCT u.id, u.full_name, u.email, u.is_online, u.last_active
       FROM users u
       JOIN investments i ON u.id = i.investor_id
       JOIN properties p ON i.project_id = p.propertyId
       WHERE p.owner_id = ? AND u.role = "investor"`,
      [ownerId]
    );

    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Fetch messages for the logged-in investor
app.get('/api/messages/investor/:ownerId', authenticateJWT, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }

  const investorId = req.user.id; // Logged-in investor
  const ownerId = req.params.ownerId; // Selected owner ID

  try {
    const [results] = await pool.query(
      `SELECT messages.id, messages.message, messages.sent_at, 
              sender.full_name AS sender_name, sender.role AS sender_role,
              receiver.full_name AS receiver_name, receiver.role AS receiver_role
       FROM messages
       LEFT JOIN users sender ON messages.sender_id = sender.id
       LEFT JOIN users receiver ON messages.receiver_id = receiver.id
       WHERE (messages.sender_id = ? AND messages.receiver_id = ?) 
          OR (messages.sender_id = ? AND messages.receiver_id = ?)
       ORDER BY messages.sent_at DESC`,
      [investorId, ownerId, ownerId, investorId] // Get messages between investor & owner
    );

    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

//fetch owners
app.get('/api/owners', authenticateJWT, async (req, res) => {
  try {
    const investorId = req.user.id;

    const [results] = await pool.query(
      `SELECT DISTINCT u.id, u.full_name, u.email, u.is_online, u.last_active
       FROM users u
       JOIN properties p ON u.id = p.owner_id
       JOIN investments i ON p.propertyId = i.project_id
       WHERE i.investor_id = ? AND u.role = "owner"`,
      [investorId]
    );

    res.json(results);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Send a message & create a notification for the receiver
app.post('/api/messages', authenticateJWT, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id; // Get user ID from JWT
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;


    // Insert message into messages table
    const [messageResult] = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message, sent_at) VALUES (?, ?, ?, NOW())`,
      [senderId, receiverId, message]
    );

    // Insert notification for receiver
    const notificationMessage = "You have a new message!";
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, read_status, created_at) 
       VALUES (?, ?, 'New Message', 'unread', NOW())`,
      [receiverId, notificationMessage]
    );

    await logAccess(senderId, ip, 'User sent new messages.');

    res.json({ 
      id: messageResult.insertId, 
      sender_id: senderId, 
      receiver_id: receiverId, 
      message 
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/analytics', authenticateJWT, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Investment performance (already correct)
    const [investmentPerformance] = await pool.query(`
      SELECT p.name AS project, COALESCE(SUM(i.amount), 0) AS investment
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ? AND i.investment_status != 'failed'
      GROUP BY p.name
    `, [ownerId]);

    // Investor activity – filtered by owner's projects
    const [investorActivity] = await pool.query(`
      SELECT 
        DATE_FORMAT(i.investment_date, '%Y-%m') AS month, 
        COUNT(DISTINCT CASE 
          WHEN i.investment_date = (
            SELECT MIN(investment_date) FROM investments 
            WHERE investor_id = i.investor_id 
              AND investment_status != 'failed'
              AND project_id IN (SELECT property_id FROM projects WHERE owner_id = ?)
          ) 
          THEN i.investor_id 
        END) AS newInvestors,
        COUNT(DISTINCT CASE 
          WHEN i.investment_date > (
            SELECT MIN(investment_date) FROM investments 
            WHERE investor_id = i.investor_id 
              AND investment_status != 'failed'
              AND project_id IN (SELECT property_id FROM projects WHERE owner_id = ?)
          ) 
          THEN i.investor_id 
        END) AS repeatInvestors
      FROM investments i
      JOIN users u ON i.investor_id = u.id
      WHERE u.role = 'investor'
        AND i.investment_status != 'failed'
        AND i.project_id IN (SELECT property_id FROM projects WHERE owner_id = ?)
      GROUP BY DATE_FORMAT(i.investment_date, '%Y-%m')
      ORDER BY DATE_FORMAT(i.investment_date, '%Y-%m')
    `, [ownerId, ownerId, ownerId]);

    // ROI reports – scoped to owner's projects
    const [roiReports] = await pool.query(`
      SELECT p.name AS project, COALESCE(AVG(i.roi_percentage), 0) AS roi
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE i.investment_status != 'failed' AND p.owner_id = ?
      GROUP BY p.name
    `, [ownerId]);

    // Earnings trends – already scoped correctly
    const [earningsTrends] = await pool.query(`
    SELECT 
  month_data.month,
  COALESCE(funds_data.earnings, 0) AS earnings,
  COALESCE(transactions_data.withdrawals, 0) AS withdrawals
FROM (
  SELECT DATE_FORMAT(t.transaction_date, '%Y-%m') AS month
  FROM transactions t
  WHERE (t.type = 'fund_release' AND t.user_id = ?)
     OR (t.type = 'withdrawal' AND t.user_id = ?)
  GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')
) AS month_data

LEFT JOIN (
  SELECT 
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
    SUM(t.amount) AS earnings
  FROM transactions t
  WHERE t.type = 'fund_release' AND t.user_id = ?
  GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')
) AS funds_data ON month_data.month = funds_data.month

LEFT JOIN (
  SELECT 
    DATE_FORMAT(t.transaction_date, '%Y-%m') AS month,
    SUM(t.amount) AS withdrawals
  FROM transactions t
  WHERE t.type = 'withdrawal' AND t.user_id = ?
  GROUP BY DATE_FORMAT(t.transaction_date, '%Y-%m')
) AS transactions_data ON month_data.month = transactions_data.month

ORDER BY month_data.month
    `, [ownerId, ownerId, ownerId, ownerId]);

    // Total investors – restricted to owner's projects
    const [totalInvestorsQuery] = await pool.query(`
      SELECT COUNT(DISTINCT i.investor_id) AS totalInvestors
      FROM investments i
      JOIN projects p ON i.project_id = p.property_id
      WHERE p.owner_id = ? AND i.investment_status != 'failed'
    `, [ownerId]);

    // Summary
    const totalInvestment = investmentPerformance.reduce((sum, item) => sum + Number(item.investment || 0), 0);
    const totalInvestors = totalInvestorsQuery[0]?.totalInvestors || 0;

    const averageROI = roiReports.length > 0
      ? roiReports.reduce((sum, item) => sum + (item.roi || 0), 0) / roiReports.length
      : 0;

    const monthlyGrowth = (() => {
      if (earningsTrends.length < 2) return 0;
      const last = earningsTrends[earningsTrends.length - 1].earnings || 0;
      const secondLast = earningsTrends[earningsTrends.length - 2].earnings || 0;
      return secondLast === 0 ? 0 : ((last - secondLast) / secondLast) * 100;
    })();

    res.json({
      investmentPerformance,
      investorActivity,
      roiReports,
      earningsTrends,
      summary: {
        totalInvestment,
        totalInvestors,
        averageROI,
        monthlyGrowth
      }
    });

  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});



app.get("/api/owner/:id", async (req, res) => {
  try {
    const ownerId = req.params.id;
    console.log("Fetching owner for:", ownerId); // Debugging

    const [owner] = await pool.query(
      "SELECT id, full_name, email, phone_number,profile_image FROM users WHERE id = ? AND role = 'owner'",
      [ownerId]
    );

    if (owner.length === 0) {
      return res.status(404).json({ error: "Owner not found" });
    }

    res.json(owner[0]); // Return owner details
  } catch (err) {
    console.error("Error fetching owner details:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Admin Dashboard - Get Platform Metrics (Only for Admin)
// Cron job that runs every day at 12:15 PM and checks if a project is fully funded and marks it as funded
cron.schedule('53 16 * * *', async () => {
  console.log('⏰ Running noon funding check...');

  try {
    const [projects] = await pool.query(`
      SELECT id, property_id, name, funding_goal, owner_id, notified_funded 
      FROM projects 
      WHERE (status = 'Active' OR status = 'Funded') 
        AND notified_funded = FALSE
    `);

    for (const project of projects) {
      const { property_id: projectId, name: projectName, funding_goal, owner_id } = project;

      const [[{ totalInvested }]] = await pool.query(`
        SELECT SUM(amount) AS totalInvested 
        FROM investments 
        WHERE project_id = ? AND status = 'approved'
      `, [projectId]);

      const investmentMet = parseFloat(totalInvested || 0) >= parseFloat(funding_goal);

      if (investmentMet) {
        // ✅ Mark project as funded if not already
        await pool.query(`
          UPDATE projects 
          SET status = 'Funded', notified_funded = TRUE 
          WHERE property_id = ?
        `, [projectId]);

        // ✅ Notify owner
        const ownerMessage = `🎉 Your project "${projectName}" is now fully funded!`;
        await pool.query(`
          INSERT INTO notifications (user_id, message, type, read_status)
          VALUES (?, ?, 'project_funded', 'unread')
        `, [owner_id, ownerMessage]);

        // ✅ Notify investors
        const [investors] = await pool.query(`
          SELECT DISTINCT investor_id FROM investments WHERE project_id = ?
        `, [projectId]);

        for (const investor of investors) {
          const investorMessage = `🚀 The project you invested in ("${projectName}") is now fully funded.`;
          await pool.query(`
            INSERT INTO notifications (user_id, message, type, read_status)
            VALUES (?, ?, 'project_funded', 'unread')
          `, [investor.investor_id, investorMessage]);
        }

        // ✅ Notify admins
        const [admins] = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);
        for (const admin of admins) {
          const adminMessage = `📢 Project "${projectName}" has reached its funding goal.`;
          await pool.query(`
            INSERT INTO notifications (user_id, message, type, read_status)
            VALUES (?, ?, 'project_funded', 'unread')
          `, [admin.id, adminMessage]);
        }

        // ✅ Send email to owner
        const [[owner]] = await pool.query(`SELECT email, full_name FROM users WHERE id = ?`, [owner_id]);

       await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: owner.email,
  subject: '🎉 Your Project Has Been Fully Funded!',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #388e3c; margin-bottom: 20px;">🎉 Congratulations, ${owner.full_name}!</h2>

        <p style="font-size: 16px; color: #333;">
          Your project "<strong>${projectName}</strong>" has successfully reached its funding goal! 🚀
        </p>

        <p style="font-size: 16px; color: #333;">
          You're now ready to move into the next exciting phase — bringing your project to life.
        </p>

        <p style="font-size: 15px; color: #444;">
          Our team is currently preparing to process and release the funds to your account.
          You'll receive a confirmation as soon as the disbursement is complete.
        </p>

        <div style="background-color: #e8f5e9; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #2e7d32;">
            ✅ Tip: Log in to your dashboard anytime to track your project’s next steps and updates.
          </p>
        </div>

        <p style="font-size: 16px; color: #333;">
          Thank you for trusting PropFundr. We're excited to see what you create!
        </p>

        <br />
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply to this email directly.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
});
        // ✅ Send email to investors
        const [investorDetails] = await pool.query(`
          SELECT DISTINCT u.email, u.full_name
          FROM investments i
          JOIN users u ON u.id = i.investor_id
          WHERE i.project_id = ?
        `, [projectId]);

        for (const investor of investorDetails) {
         await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: investor.email,
  subject: '🎉 Your Investment Project is Fully Funded!',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #1976d2; margin-bottom: 20px;">🚀 Great News, ${investor.full_name}!</h2>

        <p style="font-size: 16px; color: #333;">
          The project you invested in – "<strong>${projectName}</strong>" – has officially been <strong>fully funded</strong>!
        </p>

        <p style="font-size: 15px; color: #444;">
          Thanks to your support, the owner can now begin executing their vision. You’ll continue receiving timely updates, progress reports, and milestone alerts as the project develops.
        </p>

        <div style="background-color: #e3f2fd; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #1565c0;">
            💡 Tip: Visit your dashboard to track the project’s progress and view your full investment portfolio.
          </p>
        </div>

        <p style="font-size: 16px; color: #333;">
          We're excited to have you on this journey. Thank you for investing with PropFundr.
        </p>

        <br />
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply directly.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
});
        }

        console.log(`✅ Project ${projectId} marked as Funded + notifications and emails sent.`);
      }
    }
  } catch (err) {
    console.error('❌ Cron job error:', err);
  }
});

//Runs at 1am every night and checks for projects that haven't released funds yet and creates a fund_release transaction to owners
cron.schedule('55 16 * * *', async () => {
  console.log('💸 Running wallet fund transfer job...');

  try {
    // Get fully funded projects that haven't released funds yet
const [projects] = await pool.query(`
  SELECT 
    p.property_id AS projectId, 
    p.name AS projectName,
    p.owner_id, 
    COALESCE(SUM(i.amount), 0) AS totalFunded
  FROM projects p
  JOIN investments i ON i.project_id = p.property_id AND i.status = 'approved'
  WHERE p.status = 'Funded' 
    AND NOT EXISTS (
      SELECT 1 FROM transactions t 
      WHERE t.project_id = p.property_id AND t.type = 'fund_release'
    )
  GROUP BY p.property_id
`);

    for (const project of projects) {
     const { projectId, projectName, owner_id, totalFunded } = project;

      // ✅ Create a fund release transaction
      await pool.query(`
        INSERT INTO transactions (user_id, amount, type, status, payment_method, project_id, description)
        VALUES (?, ?, 'fund_release', 'approved', 'internal', ?, ?)
      `, [owner_id, totalFunded, projectId, 'Funding goal reached - funds released']); 

      // ✅ Update the wallets table: Add the released funds to available balance
await pool.query(`
  UPDATE wallets
  SET available_balance = available_balance + ?
  WHERE user_id = ?
`, [totalFunded, owner_id]);
      
await pool.query(`
  UPDATE properties SET start_date = NOW() WHERE propertyId = ?
`, [projectId]);

 // ✅ Notify owner
       const ownerMessage = `🎉 Funds for "${projectName}" are now released.Check your wallet and then proceed to begin the project!`;
        await pool.query(`
          INSERT INTO notifications (user_id, message, type, read_status)
          VALUES (?, ?, 'project_funded', 'unread')
        `, [owner_id, ownerMessage]);

// Notify owner by email
const [[owner]] = await pool.query(`SELECT email, full_name FROM users WHERE id = ?`, [owner_id]);

await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: owner.email,
  subject: '💸 Funds Released for Your Project!',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 35px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
        <h2 style="color: #388e3c; margin-bottom: 20px;">💸 Funds Successfully Released!</h2>

        <p style="font-size: 16px; color: #333;">
          Hi ${owner.full_name},
        </p>

        <p style="font-size: 16px; color: #333;">
          Congratulations! A total of <strong>$${totalFunded}</strong> has been released for your project: 
          "<strong>${projectName}</strong>".
        </p>

        <p style="font-size: 15px; color: #444;">
          You can now begin executing your project as planned. Remember to keep your investors engaged by providing timely updates, posting new milestones, and demonstrating progress.
        </p>

        <div style="background-color: #e8f5e9; padding: 15px 20px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-size: 15px; color: #2e7d32;">
            📌 Tip: Use your dashboard to manage project phases and investor communication effectively.
          </p>
        </div>

        <p style="font-size: 16px; color: #333;">
          Thank you for building with PropFundr. We’re excited to see your vision come to life!
        </p>

        <br />
        <p style="font-size: 16px; color: #333;"><strong>– The PropFundr Team</strong></p>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;" />
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated message. Please do not reply directly.<br/>
          © ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
});
      console.log(`💰 Released $${totalFunded} to owner ${owner_id} for project "${projectName}"`);
    }

  } catch (err) {
    console.error('❌ Wallet transfer cron job failed:', err);
  }
});

// Admin Dashboard Data Route
app.get('/api/admin/overview', authenticateJWT, async (req, res) => {
  try {
    const [properties] = await pool.query('SELECT COUNT(*) AS totalProperties FROM properties');
    const [users] = await pool.query('SELECT COUNT(*) AS activeUsers FROM users');
    
    const [funds] = await pool.query(`
      SELECT SUM(amount) AS totalFundsRaised 
      FROM investments 
      WHERE investment_status IN ('active', 'completed')
    `);

    const [revenue] = await pool.query(`
      SELECT SUM(fee_amount) AS revenue 
      FROM platform_fees 
      WHERE status = "active"
    `);

    res.json({
      totalProperties: properties[0].totalProperties,
      activeUsers: users[0].activeUsers,
      totalFundsRaised: funds[0].totalFundsRaised || 0,
      revenue: revenue[0].revenue || 0,
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Admin Login Route (for generating tokens)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  pool.query('SELECT * FROM admins WHERE username = ? AND password = ?', [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length > 0) {
      const admin = results[0];
      const token = jwt.sign({ id: admin.id, role: 'admin' }, 'your_jwt_secret', { expiresIn: '1h' });
      res.json({ token, adminName: admin.name });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});


// API routes for fetching users and updating users
// In your server.js
app.get('/api/admin/users', authenticateJWT, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, full_name, email, country, phone_number, role, status, created_at AS registration_date, last_active, profile_image
      FROM users
    `);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update user details (status, role, etc.)
app.put('/api/admin/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { status, role } = req.body;
  try {
    await pool.query("UPDATE users SET status = ?, role = ? WHERE id = ?", [status, role, id]);

       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Update',
          'User Details',
          `Admin updated a user's details`
        ]
      )
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete multiple users
app.post('/api/admin/users/delete', authenticateJWT, async (req, res) => {
  const { userIds } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    await pool.query("DELETE FROM users WHERE id IN (?)", [userIds]);

       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Review',
          'User Removal from platform',
          `Admin deleted a user from Propfundr.`
        ]
      )

    await logAccess(userIds, ip, 'Admin Deleted a user and their data.');
    res.json({ message: 'Users deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting users' });
  }
});

// Fetch user details for the profile modal
app.get('/api/admin/users/:id', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await pool.query("SELECT id, full_name, email, status, role, created_at AS registration_date, updated_at AS last_active FROM users WHERE id = ?", [id]);

    if (user.length > 0) {
      res.json(user[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user details' });
  }
});


// Toggle Ban (ban/unban user)
app.patch('/api/admin/users/:id/toggle-ban', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    await pool.query(`
      UPDATE users
      SET status = CASE WHEN status = 'active' THEN 'banned' ELSE 'active' END
      WHERE id = ?
    `, [id]);

       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'user_banned',
          'User Banned',
          `Admin ${adminName} banned user ID ${userId}`
        ]
      )

    await logAccess(userId, ip, 'Admin banned a user.');
    res.json({ message: "User status toggled successfully" });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset Password
app.post('/api/admin/users/:id/reset-password', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    const hashedPassword = await bcrypt.hash('defaultpassword123', 10); // or generate temporary one
    await pool.query(`
      UPDATE users
      SET password = ?
      WHERE id = ?
    `, [hashedPassword, id]);

         // Log it
         await pool.query(
          `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
          [
            'Update',
            'User password',
            `Admin updated a user's password.`
          ]
        )
  
    await logAccess(userId, ip, 'Admin reset password.');

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Role
app.patch('/api/admin/users/:id/update-role', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    await pool.query(`
      UPDATE users
      SET role = ?
      WHERE id = ?
    `, [role, id]);

       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Update',
          'User role',
          `Admin updated a users role.`
        ]
      )

    await logAccess(userId, ip, 'Admin updated a user role.');
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//emails
// ✅ EMAIL SENDING ENDPOINT
app.post("/api/admin/send-email", authenticateJWT, async (req, res) => {
  const { userIds, subject, message, type } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    // 1. Get emails of selected users
    const [users] = await pool.query("SELECT email FROM users WHERE id IN (?)", [userIds]);

    if (!users.length) {
      return res.status(404).json({ message: "No users found." });
    }

    // 2. Setup nodemailer transporter (like your forgot password)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Prepare emails and send to each
    for (const user of users) {
 const mailOptions = {
  from: `"PropFundr Admin" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: subject,
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f9fafb; 
      padding: 30px; 
      color: #333;
      ">
      <div style="
        max-width: 600px; 
        margin: auto; 
        background: #ffffff; 
        border-radius: 10px; 
        padding: 25px 35px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #0077cc; margin-bottom: 20px;">${subject}</h2>
        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
          ${message}
        </p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin-bottom: 15px;">
        <p style="font-size: 14px; color: #777; text-align: center; margin: 0;">
          🚀 PropFundr Platform
        </p>
      </div>
    </div>
  `,
};
      await transporter.sendMail(mailOptions); // Send email
    }

       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Messaging',
          'Email Notifications',
          `Admin sent new emails to platform users.`
        ]
      )

    await logAccess(userId, ip, 'Admin sent emails.');
    res.json({ message: "Emails sent successfully." });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ message: "Failed to send emails." });
  }
});


// Properties routes
app.get('/api/admin/properties', async (req, res) => {
  try {
    const [properties] = await pool.query(
      `SELECT 
          p.propertyId,
          p.title,
          p.description,
          p.price,
          p.status,
          p.funding_goal,
          p.location,
          p.category,
          p.created_at,
          u.full_name AS ownerName,
          COALESCE(fp.amount_raised, 0) AS amountRaised,
          COALESCE(fp.progress_percentage, 0) AS fundingProgress
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN funding_progress fp ON p.propertyId = fp.propertyId
        ORDER BY p.created_at ASC`
    );

    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).send('Server Error');
  }
});


app.post('/api/admin/properties/:id/approve', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    await pool.query('UPDATE properties SET status = "Approved" WHERE propertyId = ?', [id]);
       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Review',
          'Property Related',
          `Admin reviewed a property's details and approved it.`
        ]
      )

    await logAccess(userId, ip, 'Admin Approved a property.');
    // Get property + owner info and send notif
const [[property]] = await pool.query(`
  SELECT p.propertyId, p.title, u.email, u.full_name
  FROM properties p
  JOIN users u ON p.owner_id = u.id
  WHERE p.propertyId = ?
`, [id]);
await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: property.email,
  subject: '✅ Your Property Has Been Approved!',
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f8fa; 
      padding: 30px;
      color: #333;
    ">
      <div style="
        max-width: 600px; 
        margin: auto; 
        background: #ffffff; 
        border-radius: 8px; 
        padding: 25px 30px; 
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #28a745; margin-bottom: 20px;">Congratulations, ${property.full_name}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Your property titled <strong>"${property.title}"</strong> (ID: <strong>${property.propertyId}</strong>) has been successfully reviewed and approved by our team.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          It is now live and visible to potential investors on the <strong>PropFundr</strong> platform.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          You can log in to your dashboard to manage your property and track investor interest.
        </p>
        <br />
        <p style="color: #555; font-style: italic; font-size: 14px;">– The PropFundr Team</p>
      </div>
    </div>
  `
});
    res.status(200).send('Property approved');
  } catch (error) {
    console.error('Error approving property:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/api/admin/properties/:id/reject', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    await pool.query('UPDATE properties SET status = "Rejected" WHERE propertyId = ?', [id]);
       // Log it
       await pool.query(
        `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
        [
          'Review',
          'Property Related',
          `Admin reviewed a property's details and opted to reject it.`
        ]
      )
    await logAccess(userId, ip, 'Admin Rejected a Property.');
    // Get property + owner info and send notif
const [[property]] = await pool.query(`
  SELECT p.propertyId, p.title, u.email, u.full_name
  FROM properties p
  JOIN users u ON p.owner_id = u.id
  WHERE p.propertyId = ?
`, [id]);
await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: property.email,
  subject: '❌ Property Submission Rejected',
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f9f6f6;
      padding: 30px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background: #fff;
        border-radius: 8px;
        padding: 25px 30px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #dc3545; margin-bottom: 20px;">Hello ${property.full_name},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          We regret to inform you that your submitted property titled <strong>"${property.title}"</strong> (ID: <strong>${property.propertyId}</strong>) has been rejected after careful review.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          If you believe this was an error or wish to make corrections, please feel free to resubmit your property for consideration.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">
          For assistance or questions, please contact our support team.
        </p>
        <br />
        <p style="color: #555; font-style: italic; font-size: 14px;">– PropFundr Team</p>
      </div>
    </div>
  `
});
    res.status(200).send('Property rejected');
  } catch (error) {
    console.error('Error rejecting property:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/api/admin/properties/:id/remove', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    await pool.query('DELETE FROM properties WHERE propertyId = ?', [id]);
        // Log it
        await pool.query(
          `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
          [
            'Review',
            'Property Related',
            `Admin reviewed a property's details and opted to remove it from the platform.`
          ]
        )
    await logAccess(userId, ip, 'Admin Removed a property.');
    // Get owner email before deleting and send notif
const [[property]] = await pool.query(`
  SELECT p.propertyId, p.title, u.email, u.full_name
  FROM properties p
  JOIN users u ON p.owner_id = u.id
  WHERE p.propertyId = ?
`, [id]);
await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: property.email,
  subject: '⚠️ Your Property Has Been Removed',
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #fafafa;
      padding: 30px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background: #fff;
        border-radius: 8px;
        padding: 25px 30px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <h2 style="color: #e07b39; margin-bottom: 20px;">Hello ${property.full_name},</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          We wanted to inform you that your property titled <strong>"${property.title}"</strong> (ID: <strong>${property.propertyId}</strong>) has been removed from the PropFundr platform by our admin team.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          If you have any questions or need further clarification, please don’t hesitate to <a href="mailto:support@propfundr.com" style="color: #e07b39; text-decoration: none;">contact our support team</a>.
        </p>
        <br />
        <p style="color: #555; font-style: italic; font-size: 14px;">– PropFundr Team</p>
      </div>
    </div>
  `
});
    res.status(200).send('Property removed');
  } catch (error) {
    console.error('Error removing property:', error);
    res.status(500).send('Server Error');
  }
});


app.get("/api/admin/properties/:id", authenticateJWT, async (req, res) => {
  const propertyId = req.params.id;

  try {
    // Fetch main property details
    const [rows] = await pool.query(
      `SELECT 
          p.propertyId, 
          p.title, 
          p.description, 
          p.price, 
          p.status,
          p.funding_goal,
          p.location,
          p.category,
          p.created_at,
          u.full_name AS ownerName,
          COALESCE(fp.amount_raised, 0) AS amountRaised, 
          COALESCE(fp.progress_percentage, 0) AS fundingProgress
        FROM properties p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN funding_progress fp ON p.propertyId = fp.propertyId
        WHERE p.propertyId = ?
        LIMIT 1`,
      [propertyId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = rows[0];

    // Fetch property images
    const [imageRows] = await pool.query(
      `SELECT image_url FROM property_images WHERE propertyId = ?`,
      [propertyId]
    );
    property.images = imageRows.map(img => img.image_url);

    // Fetch property documents
    const [docRows] = await pool.query(
      `SELECT id, filename, file_url, uploaded_at, tags, description 
       FROM documents 
       WHERE propertyId = ?`,
      [propertyId]
    );
    property.documents = docRows;

    res.json(property);
  } catch (error) {
    console.error("Error fetching property details:", error);
    res.status(500).json({ message: "Database error" });
  }
});


// 🆕 **Update Property API (PUT)**
app.put("/api/admin/properties/:id/edit", authenticateJWT, async (req, res) => {
  const propertyId = req.params.id;
  const { title, description, price, status } = req.body;

  if (!title || !description || !price || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE properties 
       SET title = ?, description = ?, price = ?, status = ? 
       WHERE id = ?`,
      [title, description, price, status, propertyId]
    );

        // Log it
        await pool.query(
          `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
          [
            'Editing and Refining',
            'Properties ',
            `Admin edited a property's details.`
          ]
        )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ message: "Property updated successfully" });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Database error" });
  }
});


//financial reposrts
app.get("/api/admin/financial-overview", authenticateJWT, async (req, res) => {
  try {
    // Fetch financial stats
    const [stats] = await pool.query(`
      SELECT 
        (SELECT COALESCE(SUM(amount), 0) 
         FROM investments 
         WHERE investment_status != 'failed') AS totalInvestments,
    
        (SELECT COALESCE(SUM(amount), 0) 
         FROM payouts 
        ) AS totalPayouts,
    
        (SELECT COALESCE(SUM(fee_amount), 0) 
         FROM platform_fees 
         WHERE status = 'active') AS totalRevenue,
    
        (SELECT COUNT(DISTINCT investor_id) 
         FROM investments 
         WHERE investment_status != 'failed') AS totalInvestors,
    
        (SELECT COUNT(DISTINCT user_id)
         FROM payouts 
         WHERE status = 'processed') AS totalRecipients
    `);
    
    // Fetch recent transactions (last 15)
    const [recentTransactions] = await pool.query(`
             SELECT 
                t.id, 
                u.full_name AS user_name,  
                t.amount, 
                t.type, 
                t.status, 
                t.transaction_date
            FROM transactions t
            JOIN users u ON t.user_id = u.id  
            ORDER BY t.transaction_date DESC
            LIMIT 15
    `);
    // Fetch recent payouts (last 15)  
    const [recentPayouts] = await pool.query(`
      SELECT p.id, u.full_name AS user, p.amount, p.status, p.payout_date
      FROM payouts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.payout_date DESC
      LIMIT 15
    `);

    res.json({
      totalInvestments: stats[0]?.totalInvestments || 0,
      totalPayouts: stats[0]?.totalPayouts || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      totalInvestors: stats[0]?.totalInvestors || 0,
      totalRecipients: stats[0]?.totalRecipients || 0,
      recentTransactions,
      recentPayouts,
    });
  } catch (error) {
    console.error("Error fetching financial data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//Transactions
app.get("/api/admin/transactions", async (req, res) => {
  try {
      // Get filters from request query
      const { search, type, status } = req.query;

      let query = `
         SELECT 
    t.id, 
    u.full_name AS user_name,  
    t.amount, 
    t.type, 
    t.status, 
    t.transaction_date,
    t.payment_method,
    t.description,
    t.transaction_ref
FROM transactions t
JOIN users u ON t.user_id = u.id 
      `;

      let conditions = [];
      let values = [];

      if (search) {
          conditions.push(`(u.full_name LIKE ? OR t.id LIKE ? OR t.amount LIKE ?)`);
          values.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (type) {
          conditions.push(`t.type = ?`);
          values.push(type);
      }
      if (status) {
          conditions.push(`t.status = ?`);
          values.push(status);
      }

      if (conditions.length > 0) {
          query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY t.id ASC LIMIT 50"; // Limit results

      const [rows] = await pool.query(query, values);
      res.json(rows);
  } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post("/api/deduct-fee", authenticateJWT, async (req, res) => {
  const { transactionId, feeType, feeAmount } = req.body;

  // Insert into MySQL Database
  await pool.query(
      "INSERT INTO platform_fees (transaction_id, fee_type, fee_amount) VALUES (?, ?, ?)",
      [transactionId, feeType, feeAmount]
  );

  // Send fee to PayPal Business Account (PayPal API Call)
  const payoutData = {
      sender_batch_header: {
          email_subject: "Platform Fee Collection"
      },
      items: [
          {
              recipient_type: "EMAIL",
              amount: {
                  value: feeAmount,
                  currency: "USD"
              },
              receiver: "propfundr@gmail.com",
              note: `Fee collected for ${feeType}`
          }
      ]
  };

  const response = await axios.post("https://api-m.paypal.com/v1/payments/payouts", payoutData, {
      headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
      }
  });

  res.json({ message: "Fee deducted and transferred to business account!", response: response.data });
});

//withdrawal requests management
// ✅ Only does: verification → payout → update → notify
app.post("/api/admin/approve-withdrawal", authenticateJWT, async (req, res) => {
  const { transactionId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // ✅ 1. Get transaction details
    const [transactionResult] = await connection.query(
      `SELECT t.*, u.role, u.email, u.full_name 
FROM transactions t
JOIN users u ON t.user_id = u.id
WHERE t.id = ? AND t.status = 'pending'
`,
      [transactionId]
    );

    if (!transactionResult.length) {
      throw new Error("Transaction not found or already processed.");
    }

    const transaction = transactionResult[0];
    const userId = transaction.user_id;
    const amount = parseFloat(transaction.amount);
    const paypalEmail = transaction.paypal_email;

    // ✅ 2. Payout
    const accessToken = await getPayPalAccessToken();
    const payoutResponse = await sendPayPalPayout(accessToken, amount, paypalEmail);

    if (!payoutResponse || !payoutResponse.batch_header) {
      throw new Error("PayPal payout failed.");
    }

    // ✅ 3. Update transaction to approved
    await pool.query(
      "UPDATE transactions SET status = 'approved', transaction_date = NOW() WHERE id = ?",
      [transactionId]
    );

    // ✅ 4. Log and notify
    await pool.query(
      `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
      ['Review process', 'Withdrawals', `Admin reviewed Withdrawal request and approved it.`]
    );

    await logAccess(userId, ip, 'Admin approved withdrawal request.');

    await sendWithdrawalEm(transaction.email, transaction.full_name, "approved", amount);

    await connection.commit();

    res.json({
      message: "Withdrawal approved and sent to PayPal.",
      paypalTransactionId: payoutResponse.batch_header.payout_batch_id,
    });

    await sendWithdrawalNotification(userId, "approved");

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Admin Withdrawal Approval Error:", error);
    res.status(500).json({ error: error.message || "Failed to approve withdrawal" });
  } finally {
    if (connection) connection.release();
  }
});

const sendWithdrawalEm = async (email, fullName, status, amount) => {
  const subject = status === "approved" ? "🎉 Withdrawal Approved!" : "❌ Withdrawal Rejected";
  const isApproved = status === "approved";

  const htmlMessage = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      padding: 30px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        border-left: 6px solid ${isApproved ? '#28a745' : '#dc3545'};
      ">
        <h1 style="color: ${isApproved ? '#28a745' : '#dc3545'}; margin-bottom: 10px;">
          ${isApproved ? 'Withdrawal Approved!' : 'Withdrawal Rejected'}
        </h1>
        <p style="font-size: 18px; line-height: 1.5;">
          Hi <strong>${fullName}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">
          ${isApproved
            ? `Great news! Your withdrawal request of <strong>$${amount.toFixed(2)}</strong> has been approved and is now being processed. You should expect to receive the funds shortly.`
            : `We regret to inform you that your withdrawal request of <strong>$${amount.toFixed(2)}</strong> has been rejected. Please contact support if you have any questions or need assistance.`}
        </p>
        <br/>
        <p style="color: #555; font-style: italic; font-size: 14px;">
          – The PropFundr Team
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"PropFundr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: htmlMessage,
    });
    console.log(`✅ Withdrawal ${status} email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send ${status} email to ${email}:`, err);
  }
};


app.post("/api/admin/reject-withdrawal", authenticateJWT, async (req, res) => {
  const { transactionId } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;
  

  if (!transactionId) {
    return res.status(400).json({ message: "Transaction ID is required." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if the transaction exists and is pending
    const [transactionResult] = await connection.query(
      `SELECT t.*, u.full_name, u.email FROM transactions t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = ? AND t.status = 'pending'`,
      [transactionId]
    );

    if (!transactionResult.length) {
      throw new Error("Transaction not found or already processed.");
    }

    const transaction = transactionResult[0];

    // Mark the transaction as rejected
    await connection.query(
      "UPDATE transactions SET status = 'rejected', updated_at = NOW() WHERE id = ?",
      [transactionId]
    );

    // Send notification (can be email or internal notification)
    await sendWithdrawalNotification(transaction.user_id, "rejected");

   
     await logAccess(userId, ip, 'Admin rejected withdrawal request.');

           // Log it
           await pool.query(
            `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
            [
              'Review process',
              'Withdrawals ',
              `Admin reviewed Withdrawal request and rejected it.`
            ]
          )
      
          await sendWithdrawalEm(transaction.email, transaction.full_name, "rejected", transaction.amount);

    await connection.commit();
    res.json({ message: "Withdrawal rejected successfully." });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Admin Withdrawal Rejection Error:", error);
    res.status(500).json({ error: error.message || "Failed to reject withdrawal" });
  } finally {
    if (connection) connection.release();
  }
});

//notification
async function sendWithdrawalNotification(userId, status) {
  const message = status === "approved"
    ? "Your withdrawal request has been approved."
    : "Your withdrawal request has been rejected.";

  await pool.query(
    `INSERT INTO notifications (user_id, message, type) 
     VALUES (?, ?, ?)`,
    [userId, message, "withdrawal"]
  );
}



app.get("/api/admin/withdrawal-requests", authenticateJWT, async (req, res) => {
  try {
    const [withdrawals] = await pool.query(
      `SELECT 
  transactions.id, 
  transactions.user_id, 
  users.full_name AS user_name,
  transactions.amount,
  transactions.status,
  transactions.transaction_date,
  transactions.payment_method,
  wallets.available_balance
FROM transactions
JOIN users ON transactions.user_id = users.id
JOIN wallets ON wallets.user_id = users.id
WHERE transactions.type = 'withdrawal'
AND transactions.status = 'pending'
`);

    res.json(withdrawals);
  } catch (error) {
    console.error("❌ Error fetching withdrawal requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

///payouts handling 
app.get('/api/admin/payouts/pending-projects', authenticateJWT, async (req, res) => {
  const connection = await pool.getConnection();
  try {
 const [rows] = await connection.query(`
  SELECT 
    pr.property_id AS project_id,
    pr.name AS project_name,
    SUM(i.amount) AS total_invested,
    SUM(i.expected_return) AS total_expected,
    SUM(i.actual_return) AS total_actual,
    pr.endDate AS project_end_date,
    re.total_held
  FROM investments i
  JOIN projects pr ON i.project_id = pr.property_id
  LEFT JOIN (
    SELECT project_id, SUM(amount) AS total_held
    FROM return_escrow
    WHERE status = 'held'
    GROUP BY project_id
  ) AS re ON pr.id = re.project_id
  WHERE i.payout_status = 'pending'
    AND pr.endDate <= NOW()
    AND re.total_held IS NOT NULL
  GROUP BY pr.property_id
  ORDER BY pr.endDate DESC
`);

    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching pending payouts:", err);
    res.status(500).json({ error: "Failed to fetch pending payout projects." });
  } finally {
    connection.release();
  }
});



// Manual Payout Processor - admin triggers payout manually
app.post('/api/admin/manual-payouts/project/:propertyId', authenticateJWT, async (req, res) => {
  const { propertyId } = req.params;
  const adminId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1️⃣ Get total held return escrow for this project
 const [[projectRow]] = await connection.query(
      `SELECT id AS project_id FROM projects WHERE property_id = ?`,
      [propertyId]
    );

    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found for this property' });
    }

    const projectId = projectRow.project_id;

    const [[{ total_held = 0 } = {}]] = await connection.query(`
      SELECT SUM(amount) AS total_held
      FROM return_escrow
      WHERE project_id = ? AND status = 'held'
    `, [projectId]);

    if (total_held <= 0) {
      throw new Error('No escrow available for this project');
    }

    // 2️⃣ Get all pending investments for the project
    const [investments] = await connection.query(`
      SELECT i.id AS investment_id, i.investor_id, i.amount, i.expected_return, i.actual_return,
       u.email, pr.owner_id
FROM investments i
JOIN projects pr ON i.project_id = pr.property_id
JOIN users u ON i.investor_id = u.id
WHERE i.project_id = ? AND i.payout_status = 'pending';
    `, [propertyId]);

    if (investments.length === 0) {
      throw new Error('No pending investments found for this project');
    }

    // 3️⃣ Calculate proportional payouts
    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    if (totalInvested === 0) {
      throw new Error('Total invested amount is 0. Cannot calculate returns.');
    }

 let totalPayoutRequired = 0;
const payoutMap = [];

for (const inv of investments) {
  const { investment_id, investor_id, amount: rawAmount, expected_return, email } = inv;
  const amount = parseFloat(rawAmount);
  const expected = parseFloat(expected_return);

  if (isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid investment amount for investment ID ${investment_id}`);
  }

  const proportionalReturn = (amount / totalInvested) * total_held;
  const actual = parseFloat(proportionalReturn.toFixed(2));

  if (isNaN(actual)) {
    throw new Error(`Failed to calculate actual return for investment ID ${investment_id}`);
  }

  let payoutAmount = 0;
  let newStatus = 'pending';

  if (actual >= expected) {
    payoutAmount = actual;           // ✅ ROI
    newStatus = 'paid';
  } else if (actual === 0) {
    payoutAmount = amount;           // ✅ Refund
    newStatus = 'refunded';
  } else {
    payoutAmount = actual;           // ✅ Partial return
    newStatus = 'partially_paid';
  }

  if (isNaN(payoutAmount)) {
    throw new Error(`Invalid payout amount for investment ID ${investment_id}`);
  }

  totalPayoutRequired += payoutAmount;

  payoutMap.push({
    investment_id,
    investor_id,
    amount: payoutAmount,
    newStatus,
    actualReturn: actual,
    email
  });
}

// ✅ Escrow balance check
if (total_held < totalPayoutRequired) {
  throw new Error('Escrow balance insufficient to process all payouts.');
}
// Fetch project name and owner ID before processing
const [[projectMeta]] = await connection.query(`
  SELECT name, owner_id FROM projects WHERE id = ?
`, [projectId]);

if (!projectMeta) {
  throw new Error('Project not found');
}

const projectName = projectMeta.name;
const ownerId = projectMeta.owner_id;

    // 4️⃣ Process payouts
    for (const payout of payoutMap) {
      const { investment_id, investor_id, amount, newStatus, actualReturn, email } = payout;

      // Deduct from escrow
      const [escrowRows] = await connection.query(`
        SELECT id, amount FROM return_escrow
        WHERE project_id = ? AND status = 'held' ORDER BY id
      `, [projectId]);

      let remaining = amount;
      for (const esc of escrowRows) {
        if (remaining <= 0) break;
        const deduction = Math.min(esc.amount, remaining);
        await connection.query(`UPDATE return_escrow SET amount = amount - ? WHERE id = ?`, [deduction, esc.id]);
        remaining -= deduction;
      }

      // Credit wallet
      await connection.query(`
        UPDATE wallets SET available_balance = available_balance + ? WHERE user_id = ?
      `, [amount, investor_id]);

      // Update investment
      await connection.query(`
        UPDATE investments 
        SET payout_status = ?, 
            investment_status = ?, 
            actual_return = COALESCE(actual_return, ?)
        WHERE id = ?
      `, [
        newStatus,
        newStatus === 'refunded' ? 'failed' : 'completed',
        actualReturn,
        investment_id
      ]);

// Log payout
await connection.query(`
  INSERT INTO payouts (user_id, investment_id, amount, method, status, admin_id, transaction_ref)
  VALUES (?, ?, ?, 'internal', ?, ?, CONCAT('TXN_', UNIX_TIMESTAMP(NOW())))
`, [investor_id, investment_id, amount, newStatus, adminId]);

// ✅ Notify investor
const msg = `Your payout of $${amount.toFixed(2)} for project "${projectName}" has been ${newStatus}. Check your wallet.`;
await putNotification(connection, investor_id, msg, 'payout');

if (email) {
  await sendPayoutNotification(email, amount, newStatus, projectName);
}

    }

// 5️⃣ Mark zeroed-out escrow rows as released
await connection.query(`
  UPDATE return_escrow SET status = 'released'
  WHERE amount = 0 AND status = 'held' AND project_id = ?
`, [projectId]);

// 6️⃣ Notify owner
if (ownerId) {
  const ownerMsg = `Payouts for your project "${projectName}" have been processed.`;
  await putNotification(connection, ownerId, ownerMsg, 'project_return');
}

// 7️⃣ Notify all admins
const [admins] = await connection.query(`
  SELECT id FROM users WHERE role = 'admin'
`);

for (const admin of admins) {
  await putNotification(connection, admin.id, `Payouts for project "${projectName}" have been processed.`, 'admin_alert');
}

    // 8️⃣ Log admin activity
 await pool.query(`
  INSERT INTO admin_activity_log (type, title, description)
  VALUES (?, ?, ?)
`, ['Review', 'Project Manual Payout', `Manual payout triggered for project "${projectName}" by Admin ID ${adminId}`]);

    await logAccess(adminId, ip, `Manual payout for project "${projectName}"`);

    // 9️⃣ ✅ Check if all payouts are done and mark project as Completed
    const [[{ pendingCount }]] = await connection.query(`
      SELECT COUNT(*) AS pendingCount FROM investments 
      WHERE project_id = ? AND payout_status = 'pending'
    `, [projectId]);

    if (pendingCount === 0) {
      await connection.query(`
        UPDATE projects SET status = 'Completed' WHERE id = ?
      `, [projectId]);
      console.log(`✅ Project ${projectId} marked as Completed`);
    }

    await connection.commit();
    res.json({ message: `Payouts for project ${projectId} processed successfully.` });

  } catch (err) {
    await connection.rollback();
    console.error('❌ Manual payout error:', err.message);
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

//emailnotifications
//
const putNotification = async (connection, userId, message, type = "info") => {
  await connection.query(`
    INSERT INTO notifications (user_id, message, type, read_status)
    VALUES (?, ?, ?, 'unread')
  `, [userId, message, type]);
};
// Create email transporter
({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send payout notification
const sendPayoutNotification = async (email, amount, status, projectName) => {
  try {
    const subject = "💰 Your Investment Payout Status";

    const statusFormatted = status.replace(/_/g, " ").toUpperCase();
    const isSuccess = status.toLowerCase() === "processed" || status.toLowerCase() === "successful";

    const html = `
      <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f9fafb;
        padding: 30px;
        color: #333;
      ">
        <div style="
          max-width: 600px;
          margin: auto;
          background: #fff;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          border-left: 6px solid ${isSuccess ? '#28a745' : '#dc3545'};
        ">
          <h2 style="color: ${isSuccess ? '#28a745' : '#dc3545'}; margin-bottom: 15px;">
            Investment Payout Update
          </h2>
          <p style="font-size: 18px;">
            Hello Investor,
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Your investment return payout for the project <strong>"${projectName}"</strong> has been <strong>${statusFormatted}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            <strong>Amount:</strong> $${amount.toFixed(2)}
          </p>
          <p style="font-size: 16px; line-height: 1.6;">
            Please log in to your PropFundr dashboard to view your updated wallet balance and detailed transaction history.
          </p>
          <a href=" http://192.168.100.30:3000" style="
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 25px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin-top: 20px;
          ">Go to Dashboard</a>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Thank you for investing with PropFundr.<br>
            — The PropFundr Team
          </p>
        </div>
      </div>
    `;
    await transporter.sendMail({
      from: `"PropFundr" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${email} for payout status: ${status}`);
  } catch (error) {
    console.error(`❌ Email failed for ${email}:`, error);
  }
};

   app.get('/api/admin/payouts/property/:propertyId/distribution-preview', authenticateJWT, async (req, res) => {
  const { propertyId } = req.params;
  const connection = await pool.getConnection();

  try {
    // Resolve the project_id from the property_id
    const [[projectRow]] = await connection.query(
      `SELECT id AS project_id FROM projects WHERE property_id = ?`,
      [propertyId]
    );

    if (!projectRow) {
      return res.status(404).json({ error: 'Project not found for this property' });
    }

    const projectId = projectRow.project_id;

    // Reuse your existing distribution logic
    const [[{ total_held = 0 } = {}]] = await connection.query(`
      SELECT SUM(amount) AS total_held
      FROM return_escrow
      WHERE project_id = ? AND status = 'held'
    `, [projectId]);

    if (total_held <= 0) {
      return res.status(400).json({ error: 'No return earnings held for this project' });
    }

    const [investments] = await connection.query(`
      SELECT i.id AS investment_id, i.investor_id, i.amount, u.full_name AS investor_name
      FROM investments i
      JOIN users u ON i.investor_id = u.id
      WHERE i.project_id = ? AND i.payout_status = 'pending'
    `, [propertyId]);

    const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    const distribution = investments.map((inv) => {
      const share = parseFloat(inv.amount) / totalInvested;
      const payout = share * total_held;
      return {
        investor_id: inv.investor_id,
        investor_name: inv.investor_name,
        amount_invested: inv.amount,
        share: share.toFixed(4),
        projected_payout: payout.toFixed(2),
      };
    });

   res.json({ project_id: projectId, total_invested: totalInvested, total_held, distribution });
  } catch (err) {
    console.error('Preview distribution error:', err);
    res.status(500).json({ error: 'Failed to preview distribution' });
  } finally {
    connection.release();
  }
});



app.get("/api/admin/payout-history", authenticateJWT, async (req, res) => {
  try {
    const [payouts] = await pool.query(`
      SELECT 
        p.id, 
        u.full_name AS investor_name, 
        p.amount, 
        p.payout_date,
        pr.name AS property_name,  -- This fetches the project (property) name
        p.method AS payout_type    -- This fetches the payout method/type
      FROM payouts p
      JOIN users u ON p.user_id = u.id
      JOIN investments i ON p.investment_id = i.id  -- Join with investments to link to the correct project
      JOIN projects pr ON i.project_id = pr.id  -- Join with projects to get the property/project name
      ORDER BY p.payout_date DESC
    `);
    res.json(payouts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});



///admininvestment handling

app.get("/api/admin/pending-investments", authenticateJWT, async (req, res) => {
  try {
const [investments] = await pool.query(`
  SELECT 
    i.id, 
    u.full_name AS investorname, 
    i.amount,
    p.name AS project_name,
    w.available_balance,
    i.investment_date  -- ✅ Add this line
  FROM investments i
  JOIN users u ON i.investor_id = u.id
  JOIN projects p ON i.project_id = p.property_id
  JOIN wallets w ON u.id = w.user_id
  WHERE i.status = 'pending'
`);

    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
 
//Approve investment
app.post("/api/admin/approve-investment", authenticateJWT, async (req, res) => {
  try {
    const { investmentId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const adminId = req.user.id;

    if (!investmentId) {
      return res.status(400).json({ message: "Missing investment ID" });
    }

    // Fetch investment and related investor
    const [investmentRows] = await pool.query(
      `SELECT investments.*, users.email, users.full_name, users.id AS investorUserId
       FROM investments
       JOIN users ON investments.investor_id = users.id
       WHERE investments.id = ? AND investments.status = 'pending'`,
      [investmentId]
    );

    if (investmentRows.length === 0) {
      return res.status(404).json({ message: "Investment not found or already approved" });
    }

    const investment = investmentRows[0];

    // Approve the investment
    await pool.query(
      "UPDATE investments SET status = 'approved' WHERE id = ?",
      [investmentId]
    );

    // Log activity
    await pool.query(
      `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
      [
        'Review process',
        'Investment approved',
        `Admin approved an investment by user ID ${investment.investorUserId}.`
      ]
    );

    // Record IP log
    await logAccess(adminId, ip, 'Admin approved investment.');

    // 1️⃣ Send Notification
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, read_status) VALUES (?, ?, ?, ?)`,
      [
        investment.investorUserId,
        "Your investment has been approved! 🎉",
        "investment",
        "unread"
      ]
    );
const mailOptions = {
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: investment.email,
  subject: "✅ Investment Approved – You're In!",

  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      padding: 40px;
      color: #333;">
      
      <div style="
        max-width: 600px;
        margin: auto;
        background: #fff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        border-left: 6px solid #28a745;
      ">
        <h2 style="color: #28a745; margin-bottom: 20px;">Investment Approved!</h2>

        <p style="font-size: 18px;">Hi ${investment.full_name},</p>

        <p style="font-size: 16px; line-height: 1.6;">
          We're pleased to inform you that your investment of <strong>$${investment.amount}</strong> has been successfully approved.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          For this project, future investments from you will now be auto-approved – saving you time and getting you into action faster!
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          You can view and monitor your investment progress anytime from your <a href="http://192.168.100.30:3000" style="color: #007bff; text-decoration: none;">Active Investments</a> page.
        </p>

        <a href="http://192.168.100.30:3000" style="
          display: inline-block;
          background-color: #007bff;
          color: white;
          padding: 12px 25px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 25px;
        ">View My Investments</a>

        <p style="margin-top: 35px; color: #666; font-size: 14px;">
          Thank you for investing with PropFundr!<br>
          – The PropFundr Team
        </p>
      </div>
    </div>
  `
};
    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Investment approved and investor notified!" });
  } catch (error) {
    console.error("❌ Error approving investment:", error);
    res.status(500).json({ message: "Server error" });
  }
});




// Reject Investment
app.post("/api/admin/reject-investment", authenticateJWT, async (req, res) => {
  try {
    const { investmentId, userId } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Reject the investment
    await pool.query("UPDATE investments SET status = 'rejected' WHERE id = ?", [investmentId]);

          // Log it
          await pool.query(
            `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
            [
              'Review process',
              'Investment made',
              `Admin reviewed an investment made and rejected it.`
            ]
          )
      

    // Send notification to the investor
    await sendNotification(userId, "Your investment has been rejected.");
    await logAccess(userId, ip, 'Admin rejected an investment.');

    res.json({ message: "Investment rejected successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Function to send notification
async function sendNotification(userId, message) {
  await pool.query(
    "INSERT INTO notifications (user_id, message, type, read_status) VALUES (?, ?, ?, 'unread')",
    [userId, message, 'investment']
  );
}


// API endpoint for admin to approve or reject return earnings 
// API endpoint to fetch all return earnings for admin
app.get('/api/admin/return-earnings', authenticateJWT, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [returnEarnings] = await connection.query(`
      SELECT 
        re.id,
        re.owner_id,
        re.project_id,
        re.amount,
        re.created_at,
        re.reference,
        re.status,
        re.approved_by,
        u.full_name AS owner_name,
        p.name AS project_name,
        w.available_balance
      FROM return_earnings re
      LEFT JOIN users u ON re.owner_id = u.id
      LEFT JOIN projects p ON re.project_id = p.id
      LEFT JOIN wallets w ON re.owner_id = w.user_id
      WHERE re.status = 'pending'
      ORDER BY re.created_at DESC
    `);

    res.json(returnEarnings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while fetching return earnings' });
  } finally {
    connection.release();
  }
});



app.post('/api/admin/return-earnings/:id/approve', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'confirmed' or 'rejected'
  const adminId = req.user.id;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  if (!['confirmed', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Fetch the return earning record
    const [[earning]] = await connection.query(
      'SELECT * FROM return_earnings WHERE id = ? FOR UPDATE',
      [id]
    );

    if (!earning) {
      return res.status(404).json({ error: 'Return earning not found' });
    }

    // Fetch project name using project_id
    const [[project]] = await connection.query(
      'SELECT name FROM projects WHERE id = ?',
      [earning.project_id]
    );

    const projectName = project?.name || 'Unknown Project';

    if (status === 'confirmed') {
      // Lock owner's wallet
      const [[wallet]] = await connection.query(
        'SELECT * FROM wallets WHERE user_id = ? FOR UPDATE',
        [earning.owner_id]
      );

      if (!wallet) {
        return res.status(404).json({ error: 'Owner wallet not found' });
      }

      if (wallet.available_balance < earning.amount) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }

      // Deduct amount from wallet
      await connection.query(
        'UPDATE wallets SET available_balance = available_balance - ? WHERE user_id = ?',
        [earning.amount, earning.owner_id]
      );

      // Insert into return_escrow table
      await connection.query(
        `INSERT INTO return_escrow (owner_id, project_id, amount, status)
         VALUES (?, ?, ?, 'held')`,
        [earning.owner_id, earning.project_id, earning.amount]
      );
    }

    // Update return_earnings status
    await connection.query(
      'UPDATE return_earnings SET status = ?, approved_by = ? WHERE id = ?',
      [status, adminId, id]
    );

    // Platform notification
    const platformMessage = `Your return earning for project "${projectName}" (Amount: ${earning.amount}) has been ${status}.`;

    await connection.query(
      `INSERT INTO notifications (user_id, message, type, read_status)
       VALUES (?, ?, ?, 'unread')`,
      [earning.owner_id, platformMessage, 'return_earning']
    );

    // Log admin activity
    await pool.query(
      `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
      [
        'Review process',
        'Return Earnings',
        `Admin reviewed return earnings for project "${projectName}".`
      ]
    );

    await logAccess(userId, ip, `Admin approved return earnings for project "${projectName}".`);

    // Email notification
  // Email message
const emailMessage = `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f9f9fb;
    padding: 40px;
    color: #333;
  ">
    <div style="
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      border-left: 6px solid ${status === 'approved' ? '#28a745' : '#dc3545'};
    ">
      <h2 style="color: ${status === 'approved' ? '#28a745' : '#dc3545'};">
        Return Earning ${status.toUpperCase()}
      </h2>

      <p style="font-size: 16px;">
        Hello <strong>Project Owner</strong>,
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        This is to inform you that your return earning for the project 
        <strong>"${projectName}"</strong> has been 
        <strong style="text-transform: uppercase;">${status}</strong> by the PropFundr admin team.
      </p>

      <p style="font-size: 16px;">
        <strong>Amount:</strong> $${earning.amount}
      </p>

      <p style="font-size: 16px; line-height: 1.6;">
        You can review your earnings and financial summary on your 
        <a href="http://192.168.100.30:3000" style="color: #007bff; text-decoration: none;">Earnings Dashboard</a>.
      </p>

      <a href="http://192.168.100.30:3000" style="
        display: inline-block;
        margin-top: 25px;
        background-color: #007bff;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
      ">View Earnings</a>

      <p style="margin-top: 35px; color: #666; font-size: 14px;">
        Thank you for being part of PropFundr.<br>
        – The PropFundr Team
      </p>
    </div>
  </div>
`;
    await sendNotificationEmail(
      earning.owner_id,
      `Return Earning ${status.toUpperCase()}`,
      emailMessage
    );

    await connection.commit();
    res.json({ message: `Return earning ${status} successfully.` });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    connection.release();
  }
});
// Helper function to send email from user_id
const sendNotificationEmail = async (userId, subject, htmlContent) => {
  const [[user]] = await pool.query('SELECT email FROM users WHERE id = ?', [userId]);
  if (user && user.email) {
    await transporter.sendMail({
      from: `"PropFundr" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html: htmlContent,
    });
  }
};



//cronjob that reminds owners and admins that end date of a project is nearing to prepare the necessary details and actions
// 🔁 Run every night at 00:00
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running Project End Reminder Job...");

  try {
    const today = dayjs().startOf("day");

    const [projects] = await pool.query(`
      SELECT 
        p.id AS project_id,
        p.name AS project_name,
        p.end_date,
        u.email AS owner_email,
        u.id AS owner_id
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.status = 'active'
    `);

    for (const project of projects) {
      const diffDays = dayjs(project.end_date).diff(today, "day");

      if ([14, 7, 1].includes(diffDays)) {
        const msg = `Your project "${project.project_name}" is ending in ${diffDays} day(s). Prepare returns & final report.`;

        // Notify Owner
        await addNotification(pool, project.owner_id, msg, "project_reminder");

        if (project.owner_email) {
          await sendEmail({
            to: project.owner_email,
            subject: "Project Ending Soon - Action Needed",
            html: `
              <p>Dear Owner,</p>
              <p>Your project <b>${project.project_name}</b> is ending in ${diffDays} day(s). Please prepare and submit actual returns and final reports.</p>
              <p>Regards,<br/>PropFundr Team</p>
            `
          });
        }

        // Notify Admins
        const [admins] = await pool.query(`SELECT id, email FROM users WHERE role = 'admin'`);
        for (const admin of admins) {
          await addNotification(pool, admin.id, `Project "${project.project_name}" ends in ${diffDays} days`, "admin_alert");

          if (admin.email) {
            await sendEmail({
              to: admin.email,
              subject: "Project Nearing End Date",
              html: `<p>Heads up! <b>${project.project_name}</b> is ending in ${diffDays} days. Monitor return submissions.</p>`
            });
          }
        }
      }
    }

    console.log("✅ Project reminders sent.");
  } catch (err) {
    console.error("❌ Cron Job Failed:", err.message);
  }
});

// 🔹 Admin: Get projects ending within 14 days (and not completed yet)
app.get("/api/admin/projects-ending-soon", authenticateJWT, async (req, res) => {
  try {
    const [projects] = await pool.query(`
      SELECT 
        p.id, p.name, p.endDate,
        DATEDIFF(p.endDate, NOW()) AS days_remaining,
        u.id AS owner_id, u.email AS owner_email
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.status != 'Completed' AND DATEDIFF(p.endDate, NOW()) BETWEEN 0 AND 14
      ORDER BY p.endDate ASC
    `)

    res.json(projects)
  } catch (err) {
    console.error("❌ Failed to fetch admin ending soon:", err)
    res.status(500).json({ message: "Error loading projects" })
  }
})



// 📨 Admin remind owner + email
app.post("/api/admin/remind-owner", authenticateJWT, async (req, res) => {
  const { project_id, owner_id } = req.body;
  const adminId = req.user.id;

  try {
    // 1. Get project name
    const [projectRows] = await pool.query(
      "SELECT name FROM projects WHERE id = ?",
      [project_id]
    );
    if (projectRows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    const projectName = projectRows[0].name;

    // 2. Get owner's name and email
    const [ownerRows] = await pool.query(
      "SELECT full_name, email FROM users WHERE id = ?",
      [owner_id]
    );
    if (ownerRows.length === 0) {
      return res.status(404).json({ message: "Owner not found" });
    }
    const { full_name: ownerName, email: ownerEmail } = ownerRows[0];

    // 3. Send platform notification
    await pool.query(
      `INSERT INTO notifications (user_id, message, type, read_status)
       VALUES (?, ?, 'reminder', 'unread')`,
      [
        owner_id,
        `Reminder: Please prepare to submit returns for project "${projectName}".`,
      ]
    );

  await transporter.sendMail({
  from: `"PropFundr" <${process.env.EMAIL_USER}>`,
  to: ownerEmail,
  subject: `⏳ Reminder: Prepare to Submit Returns for "${projectName}"`,
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      padding: 40px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        border-left: 6px solid #ffc107;
      ">
        <h2 style="color: #ff9800;">Return Submission Reminder</h2>

        <p style="font-size: 16px;">
          Dear ${ownerName},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          Your project <strong>"${projectName}"</strong> is approaching its end date.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          This is a kind reminder to begin preparing your return earnings for this project.
          Once the end date is reached, please ensure you submit the returns promptly and in an organized manner.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          To begin the submission process, please log in to your account on your Owner Dashboard.
        </p>

        <a href="http://192.168.100.30:3000" style="
          display: inline-block;
          margin-top: 25px;
          background-color: #007bff;
          color: white;
          padding: 12px 25px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
        ">Go to Dashboard</a>

        <p style="margin-top: 35px; color: #666; font-size: 14px;">
          Thank you for your continued commitment to transparency.<br>
          – PropFundr Admin Team
        </p>
      </div>
    </div>
  `,
});

    // 5. Log admin activity
    await pool.query(
      `INSERT INTO admin_activity_log (type, title, description)
       VALUES ('Reminder', 'Manual Owner Reminder', 'Admin ${adminId} reminded owner ${owner_id} for project "${projectName}"')`
    );

    res.json({ message: "Reminder sent to owner via platform and email" });
  } catch (err) {
    console.error("❌ Failed to remind owner:", err);
    res.status(500).json({ message: "Error sending reminder" });
  }
});


app.get("/api/admin/financial-reports", authenticateJWT, async (req, res) => {
  try {
    // Get total deposits
    const [totalDeposits] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'deposit' AND status = 'approved'"
    );

    // Get total withdrawals
    const [totalWithdrawals] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'withdrawal' AND status = 'approved'"
    );

    // Get total payouts (earnings)
    const [totalPayouts] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = 'earning' AND status = 'approved'"
    );

    res.json({
      totalDeposits: totalDeposits[0].total,
      totalWithdrawals: totalWithdrawals[0].total,
      totalPayouts: totalPayouts[0].total,
    });
  } catch (error) {
    console.error("❌ Error fetching financial reports:", error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/admin/notifications", authenticateJWT, async (req, res) => {
  try {
    const adminId = req.user.id; // 🛡️ Get admin's ID from JWT
    console.log("🔍 Admin ID from JWT:", adminId);

    const [notifications] = await pool.query(
      `SELECT id, message, created_at, read_status, type
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [adminId]
    );

    console.log("🔔 Notifications for Admin:", notifications);
    res.json({ notifications });
  } catch (error) {
    console.error("❌ Error fetching admin notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.put("/api/admin/notifications/read", authenticateJWT, async (req, res) => {
  try {
    const adminId = req.user.id; // 🔥 Get admin's ID from JWT

    await pool.query(
      "UPDATE notifications SET read_status = 'read' WHERE user_id = ?",
      [adminId]
    );

    res.json({ message: "All admin notifications marked as read" });
  } catch (error) {
    console.error("❌ Error updating notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/admin/notifications/unread-count", authenticateJWT, async (req, res) => {
  try {
    const adminId = req.user.id; // 🔥 Get admin's ID from JWT

    const [rows] = await pool.query(
      "SELECT COUNT(*) AS unreadCount FROM notifications WHERE read_status = 'unread' AND user_id = ?",
      [adminId]
    );

    res.json({ unreadCount: rows[0]?.unreadCount || 0 });
  } catch (error) {
    console.error("❌ Error fetching unread count:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// Revenue API
app.get('/api/admin/revenue', async (req, res) => {
  try {
    const result = await pool.query('SELECT date, amount FROM revenue ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching revenue:', err);
    res.status(500).send('Internal Server Error');
  }
});



// Platform Earnings API
// Platform Earnings API
app.get("/api/admin/platform-earnings", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied." });
    }

    // Get total earnings by fee type where status is active
    const [activeFees] = await pool.query(`
      SELECT 
        fee_type, 
        SUM(fee_amount) AS total_earned
      FROM platform_fees
      WHERE status = 'active'
      GROUP BY fee_type
    `);

    // Total active earnings
    const [activeTotal] = await pool.query(`
      SELECT SUM(fee_amount) AS total_platform_earnings
      FROM platform_fees
      WHERE status = 'active'
    `);

    // Total reversed losses
    const [reversedTotal] = await pool.query(`
      SELECT SUM(fee_amount) AS total_platform_losses
      FROM platform_fees
      WHERE status = 'reversed'
    `);

    res.json({
      total_platform_earnings: activeTotal[0]?.total_platform_earnings || 0,
      total_platform_losses: reversedTotal[0]?.total_platform_losses || 0,
      breakdown: activeFees,
    });
  } catch (err) {
    console.error("Admin Fee Tracking Error:", err);
    res.status(500).json({ error: "Failed to fetch platform earnings." });
  }
});

// KYC approval by admin - fetch pending submissions
app.get("/api/admin/kyc-submissions", async (req, res) => {
  try {
    const [applications] = await pool.query(`
      SELECT 
        kyc_submissions.id, 
        users.full_name AS username, 
        kyc_submissions.dob, 
        kyc_submissions.address, 
        kyc_submissions.id_front, 
        kyc_submissions.id_back,
        kyc_submissions.address_proof, 
        kyc_submissions.selfie, 
        kyc_submissions.doc_with_user_photo,
        kyc_submissions.status,
        kyc_submissions.created_at AS submission_date
      FROM kyc_submissions 
      JOIN users ON kyc_submissions.user_id = users.id 
      WHERE kyc_submissions.status = 'pending';
    `);

const formattedApplications = applications.map(app => ({
  ...app,
  id_front: app.id_front ? `http://localhost:5000/${app.id_front.replace(/\\/g, "/")}` : null,
  id_back: app.id_back ? `http://localhost:5000/${app.id_back.replace(/\\/g, "/")}` : null,
  address_proof: app.address_proof ? `http://localhost:5000/${app.address_proof.replace(/\\/g, "/")}` : null,
  selfie: app.selfie ? `http://localhost:5000/${app.selfie.replace(/\\/g, "/")}` : null,
  doc_with_user_photo: app.doc_with_user_photo ? `http://localhost:5000/${app.doc_with_user_photo.replace(/\\/g, "/")}` : null,
}));

    res.json(formattedApplications);
  } catch (error) {
    console.error("Error fetching KYC submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/admin/kyc-update", authenticateJWT, async (req, res) => {
  const { id, status } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const adminId = req.user.id;

  if (!id || !status || !["verified", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid or missing status" });
  }

  try {
    // Get user_id from KYC submission
    const [kycResult] = await pool.query("SELECT user_id FROM kyc_submissions WHERE id = ?", [id]);
    if (kycResult.length === 0) {
      return res.status(404).json({ error: "KYC submission not found" });
    }

    const userId = kycResult[0].user_id;

    // Get user's email
    const [userResult] = await pool.query("SELECT email FROM users WHERE id = ?", [userId]);
    const userEmail = userResult[0]?.email;
    if (!userEmail) {
      return res.status(404).json({ error: "User email not found" });
    }

    // Handle logic depending on status
    if (status === "verified") {
      await pool.query("UPDATE kyc_submissions SET status = ? WHERE id = ?", ["verified", id]);
      await pool.query("UPDATE users SET kyc_status = ? WHERE id = ?", ["verified", userId]);
    } else if (status === "rejected") {
      await pool.query("DELETE FROM kyc_submissions WHERE id = ?", [id]);
      await pool.query("UPDATE users SET kyc_status = ? WHERE id = ?", ["pending", userId]);
    }

    // Notification message
    const notificationMessage =
      status === "verified"
        ? "✅ Your KYC has been successfully verified. You now have full access to PropFundr!"
        : "❌ Your KYC submission has been rejected. Please review your documents and try again.";

    // Insert notification into database
    await pool.query("INSERT INTO notifications (user_id, message) VALUES (?, ?)", [
      userId,
      notificationMessage,
    ]);

    // Log admin activity
    await pool.query(
      "INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)",
      [
        "Kyc",
        "Kyc Review",
        `Admin reviewed KYC submission ID ${id}. Status: ${status}`,
      ]
    );

    // Log access
    await logAccess(adminId, ip, `Admin set KYC status to ${status}`);

    // Send email notification
    await sendEmNotification(userEmail, status);

    return res.json({
      success: true,
      message: `KYC ${status} processed and user notified.`,
    });
  } catch (error) {
    console.error("❌ Error in KYC update:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const sendEmNotification = async (userEmail, status) => {
  const isApproved = status === "verified";

  const subject = isApproved
    ? "✅ Your KYC Has Been Approved"
    : "❌ Your KYC Submission Was Rejected";

  const message = `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      padding: 40px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
        border-left: 6px solid ${isApproved ? '#28a745' : '#dc3545'};
      ">
        <h2 style="color: ${isApproved ? '#28a745' : '#dc3545'};">
          ${isApproved ? 'KYC Approved 🎉' : 'KYC Rejected ⚠️'}
        </h2>

        <p style="font-size: 16px; line-height: 1.6;">
          ${isApproved
            ? "Congratulations! Your KYC (Know Your Customer) verification has been approved successfully. You now have full access to all features on the PropFundr platform, including making and managing investments."
            : "Unfortunately, your KYC submission was not approved after review. Please ensure your documents are clear, accurate, and match your registered information before resubmitting."}
        </p>
        ${
          isApproved
            ? `<p style="font-size: 16px;">You can now begin exploring investment opportunities confidently.</p>`
            : `<p style="font-size: 16px;">To resubmit your documents, please visit your account's <a href="http://192.168.100.30:3000" style="color: #007bff; text-decoration: none;">KYC section</a>.</p>`
        }
        ${
          !isApproved
            ? `<a href="http://192.168.100.30:3000" style="
                display: inline-block;
                margin-top: 25px;
                background-color: #dc3545;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              ">Resubmit Documents</a>`
            : `<a href="http://192.168.100.30:3000" style="
                display: inline-block;
                margin-top: 25px;
                background-color: #28a745;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              ">Go to Dashboard</a>`
        }
        <p style="margin-top: 35px; color: #666; font-size: 14px;">
          Thank you for being a part of PropFundr.<br>
          – The PropFundr Team
        </p>
      </div>
    </div>
  `;
  try {
    await transporter.sendMail({
      from: `"PropFundr" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject,
      html: message,
    });

    console.log(`✅ Email sent to ${userEmail} about KYC ${status}`);
  } catch (error) {
    console.error("❌ Error sending KYC email:", error);
  }
};
/////////
app.get("/api/users/:id/kyc-status", async (req, res) => {
  const userId = req.params.id

  try {
    const [rows] = await pool.query(
      "SELECT status FROM kyc_submissions WHERE user_id = ? LIMIT 1",
      [userId]
    )

    if (rows.length === 0) {
      return res.status(200).json({ status: "not_submitted" })
    }

    return res.status(200).json({ status: rows[0].status })
  } catch (err) {
    console.error("KYC Status Fetch Error:", err)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})



app.get("/api/admin/security-data", authenticateJWT, async (req, res) => {
  try {
    // 🚨 Get flagged fraudulent activities
    const [flaggedActivities] = await pool.query(`
      SELECT id, user_id, ip_address, activity_type, flagged_at, notes 
      FROM fraudulent_activities 
      ORDER BY flagged_at DESC
    `);

    // 🔐 Get security logs (access logs)
    const [securityLogs] = await pool.query(`
      SELECT id, user_id, log_details, log_time 
      FROM access_logs 
      ORDER BY log_time DESC
    `);

    // ❌ Get failed login attempts
    const [failedLogins] = await pool.query(`
      SELECT id, user_id, ip_address, failed_at, failure_reason, attempts 
      FROM failed_logins 
      ORDER BY failed_at DESC
    `);

    

    res.json({ flaggedActivities, securityLogs, failedLogins,  });
  } catch (error) {
    console.error("❌ Error fetching security data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//runs every 30mins for security pattern check
cron.schedule('*/30 * * * *', async () => {
  console.log("🔍 Running security pattern check...");

  const [usersWithFailures] = await pool.query(`
    SELECT user_id, COUNT(*) AS failed_count, MAX(failed_at) as last_attempt
    FROM failed_logins
    WHERE failed_at > (NOW() - INTERVAL 10 MINUTE)
    GROUP BY user_id
    HAVING failed_count >= 5
  `);

  if (usersWithFailures.length === 0) {
    console.log("✅ No suspicious activity found.");
    return;
  }

  for (const row of usersWithFailures) {
    // 1. Insert into fraudulent_activities
    await pool.query(`
      INSERT INTO fraudulent_activities (user_id, ip_address, activity_type, notes)
      VALUES (?, ?, ?, ?)
    `, [
      row.user_id,
      null,
      'Repeated failed logins',
      `${row.failed_count} failed attempts in last 10 minutes`
    ]);

    // 2. Get user details for the message
    const [[user]] = await pool.query(`SELECT full_name FROM users WHERE id = ?`, [row.user_id]);
    const userName = user ? user.full_name : `User ID ${row.user_id}`;

    // 3. Get all admin users
    const [admins] = await pool.query(`SELECT id FROM users WHERE role = 'admin'`);

    // 4. Insert a notification for each admin
    const notificationMessage = `🚨 Alert: ${userName} has had ${row.failed_count} failed login attempts in the last 10 minutes. Possible fraudulent activity.`;

    for (const admin of admins) {
      await pool.query(`
        INSERT INTO notifications (user_id, message, type, read_status)
        VALUES (?, ?, ?, ?)
      `, [
        admin.id,
        notificationMessage,
        'security_alert',
        'unread'
      ]);
    }
  }

  console.log(`✅ Pattern check complete. Flagged ${usersWithFailures.length} users and notified admins.`);
});



// Every Monday at 10AM  scheduled promotion update email
cron.schedule('0 10 * * 1', async () => {
  try {
    // ✅ Get ALL users
    const [users] = await pool.query("SELECT full_name, email FROM users");

    for (let user of users) {
const mailOptions = {
  from: `"PropFundr Team" <${process.env.EMAIL_USER}>`,
  to: user.email,
  subject: "📢 Your Weekly PropFundr Update is Here!",
  html: `
    <div style="
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      padding: 40px;
      color: #333;
    ">
      <div style="
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      ">
        <h2 style="color: #2c3e50;">Hi ${user.full_name}, 👋</h2>

        <p style="font-size: 16px; line-height: 1.6;">
          Here’s what’s new on <strong>PropFundr</strong> this week:
        </p>

        <ul style="font-size: 16px; line-height: 1.8; padding-left: 20px;">
          <li>🏘️ <strong>New Property Listings:</strong> Fresh investment opportunities are live now.</li>
          <li>📊 <strong>Portfolio Enhancements:</strong> Enjoy real-time updates and analytics.</li>
          <li>💬 <strong>Expert Insights:</strong> Weekly tips to help you maximize your ROI.</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://192.168.100.30:3000/login" style="
            background-color: #28a745;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          ">Visit Your Dashboard</a>
        </div>

        <p style="font-size: 14px; color: #666;">
          You're receiving this email because you're a valued PropFundr user.
          If you wish to manage your email preferences, please visit your account settings.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <p style="font-size: 13px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
      await transporter.sendMail(mailOptions);
    }
    console.log(`✅ Weekly emails sent to ${users.length} users.`);
  } catch (err) {
    console.error("❌ Error sending weekly update emails:", err);
  }
});

//support ticket/admin responce via email
app.get("/api/admin/support-tickets", authenticateJWT, async (req, res) => {
  try {
    const [tickets] = await pool.query(`
      SELECT 
        st.id, 
        st.subject, 
        st.description, 
        st.status, 
        st.admin_response, 
        st.created_at, 
        u.full_name, 
        u.email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `);

    res.json(tickets);
  } catch (error) {
    console.error("❌ Error fetching tickets:", error);
    res.status(500).json({ error: "Server error" });
  }
});


({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email app password
  },
});

app.put("/api/admin/support-tickets/:id", async (req, res) => {
  const { id } = req.params;
  const { response, status } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  try {
    // Fetch user's email by joining support_tickets with users table
    const [ticket] = await pool.query(
      `SELECT users.email, support_tickets.subject 
       FROM support_tickets 
       JOIN users ON support_tickets.user_id = users.id 
       WHERE support_tickets.id = ?`,
      [id]
    );

    if (!ticket.length) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const userEmail = ticket[0].email;
    const ticketSubject = ticket[0].subject;

    // Update ticket status & response
    await pool.query(
      "UPDATE support_tickets SET admin_response = ?, status = ? WHERE id = ?",
      [response, status, id]
    );

    // Log it
    await pool.query(
      `INSERT INTO admin_activity_log (type, title, description) VALUES (?, ?, ?)`,
      [
        'Support',
        'Support Ticket solving',
        `Admin solved and dealt with support ticket query.`
      ]
    )

    // Send Email Notification to User
   const mailOptions = {
  from: '"PropFundr Support" <propfundr@gmail.com>',
  to: userEmail,
  subject: `🎫 Support Ticket Update: ${ticketSubject}`,
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 25px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
        
        <h2 style="color: #2c3e50;">Hello,</h2>

        <p style="font-size: 16px; color: #333;">
          Your support ticket regarding <strong>"${ticketSubject}"</strong> has been updated.
        </p>

        <div style="margin: 20px 0; background-color: #f1f1f1; padding: 15px; border-left: 4px solid #007bff; border-radius: 5px;">
          <p style="margin: 0; color: #444;"><strong>Admin Response:</strong></p>
          <p style="font-style: italic; margin: 5px 0 0;">"${response}"</p>
        </div>

        <p style="font-size: 16px; color: #333;">
          <strong>Status:</strong> <span style="color: ${status === 'Resolved' ? '#28a745' : '#e67e22'};">${status}</span>
        </p>

        <p style="margin-top: 30px; font-size: 16px; color: #333;">
          You can view the full conversation and reply by logging into your PropFundr dashboard.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="http://192.168.100.30:3000/login" style="background-color: #007bff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
        </div>

        <hr style="margin-top: 40px; border: none; border-top: 1px solid #eee;">

        <p style="font-size: 14px; color: #888; text-align: center;">
          If you have any further concerns, feel free to reply to this ticket or contact us directly at support@propfundr.com.
        </p>

        <p style="font-size: 13px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} PropFundr. All rights reserved.
        </p>
      </div>
    </div>
  `
};
    await transporter.sendMail(mailOptions);
    await logAccess(userId, ip, 'Admin updated tickets sent by user.');

    res.json({ message: "Ticket updated and email sent successfully!" });
  } catch (error) {
    console.error("❌ Error updating ticket:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// user support ticket creatiion
app.post("/api/support-tickets", authenticateJWT, async (req, res) => {
  const { name, email, subject, message } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const userId = req.user.id;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Insert support ticket
    const [result] = await connection.query(
      "INSERT INTO support_tickets (user_id, subject, description, status) VALUES (?, ?, ?, 'open')",
      [userId, subject, message]
    );

    // 2. Log access
    await logAccess(userId, ip, 'User created a support ticket.');

    // 3. Notify all admins
    const [admins] = await connection.query(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    const messageText = `A new support ticket has been created: "${subject}"`;

    const notificationInserts = admins.map(admin => [
      admin.id,
      messageText,
      'support',
      'unread'
    ]);

    if (notificationInserts.length > 0) {
      await connection.query(
        "INSERT INTO notifications (user_id, message, type, read_status) VALUES ?",
        [notificationInserts]
      );
    }

    await connection.commit();
    res.status(201).json({ message: "Ticket created successfully", ticketId: result.insertId });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Support Ticket Error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    if (connection) connection.release();
  }
});



//recent activities
app.get("/api/admin/recent-activity", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT type, title, description, 
             DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as timestamp
      FROM admin_activity_log
      ORDER BY created_at DESC
      LIMIT 10
    `)

    const activity = rows.map(row => ({
      ...row,
      timestamp: formatTimeAgo(row.timestamp)
    }))

    res.json(activity)
  } catch (err) {
    console.error("❌ Error fetching recent activity:", err)
    res.status(500).json({ error: "Failed to fetch recent activity" })
  }
})


///// POST: Add feedback/testimonial
// POST: Add feedback/testimonial
app.post("/api/feedback", async (req, res) => {
  try {
    const { name, role, content, rating } = req.body;

    // Default avatar URL (use any placeholder service or your own image path)
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    const sql = `
      INSERT INTO testimonials (name, role, avatar, content, rating)
      VALUES (?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [name, role, avatar, content, rating]);
    res.status(201).json({ message: "Feedback added successfully" });
  } catch (err) {
    console.error("Error saving feedback:", err);
    res.status(500).json({ message: "Error saving feedback", error: err });
  }
});


// GET: Fetch all testimonials
app.get("/api/feedback", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT * FROM testimonials ORDER BY created_at DESC"
    );
    res.json(results);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).json({ message: "Error fetching feedback", error: err });
  }
});


// Utility to format timestamp to "X hours ago"
function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return `${diff} seconds ago`
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return `${Math.floor(diff / 86400)} days ago`
}



// Root route for testing
app.get('/', (req, res) => {
  res.send('Welcome to PropFundr Real Estate Crowdfunding Platform');
});


server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});

