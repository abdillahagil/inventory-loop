import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Routes with different access levels
router.route('/')
  .get(getProducts)
  .post(authorize('superadmin'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('superadmin'), updateProduct)
  .delete(authorize('superadmin'), deleteProduct);

export default router; 