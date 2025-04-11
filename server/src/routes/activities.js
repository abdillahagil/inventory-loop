import express from 'express';
import { getRecentActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Get recent activities
router.get('/', getRecentActivities);

export default router; 