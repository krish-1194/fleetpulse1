import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, refreshAccessToken, logoutUser } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken); // New route for refreshing tokens
router.post('/logout', logoutUser); // New route for logout

// Private routes
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;
