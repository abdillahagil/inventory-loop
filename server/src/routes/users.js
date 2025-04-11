import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes for superadmin only
router.route('/')
  .get(authorize('superadmin'), getUsers)
  .post(authorize('superadmin'), createUser);

router.route('/:id')
  .get(authorize('superadmin'), getUserById)
  .put(authorize('superadmin'), updateUser)
  .delete(authorize('superadmin'), deleteUser);

export default router; 