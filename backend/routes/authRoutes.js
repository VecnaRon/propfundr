import express from 'express';
import { registerUser, loginUser, getOwnerWallet } from '../controllers/authController.js';
import { exportCSV } from '../controllers/exportController.js'; // ✅ Import the export controller function
import authenticateJWT from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/wallet', authenticateJWT, getOwnerWallet);

// ✅ Add export route (protected or public — your choice)
router.post('/export-data/:type', authenticateJWT, exportCSV); // Correct route definition


export default router;
