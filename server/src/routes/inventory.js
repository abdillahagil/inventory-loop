import express from 'express';
import {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
  getLowStockItems
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes with different access levels
router.route('/')
  .get(getInventory)
  .post(authorize('superadmin', 'godownadmin'), createInventory);

// Low stock items route
router.get('/low-stock', getLowStockItems);

router.route('/:id')
  .get(getInventoryById)
  .put(authorize('superadmin', 'godownadmin'), updateInventory)
  .delete(authorize('superadmin', 'godownadmin'), deleteInventory);

export default router; 