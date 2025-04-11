import express from 'express';
import {
  getShops,
  getShopById,
  createShop,
  updateShop,
  deleteShop
} from '../controllers/shopController.js';

const router = express.Router();

// Public routes for shops - no authentication required
router.route('/')
  .get(getShops)
  .post(createShop);

router.route('/:id')
  .get(getShopById)
  .put(updateShop)
  .delete(deleteShop);

export default router; 