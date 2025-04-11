import express from 'express';
import {
  getGodowns,
  getGodownById,
  createGodown,
  updateGodown,
  deleteGodown
} from '../controllers/godownController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection middleware to all routes
router.use(protect);

// Routes for godowns
router.route('/')
  .get(authorize('superadmin', 'godownadmin'), getGodowns)
  .post(authorize('superadmin'), createGodown);

router.route('/:id')
  .get(authorize('superadmin', 'godownadmin'), getGodownById)
  .put(authorize('superadmin'), updateGodown)
  .delete(authorize('superadmin'), deleteGodown);

export default router; 