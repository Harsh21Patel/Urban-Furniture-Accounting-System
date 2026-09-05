import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  archiveProduct,
} from '../controllers/product.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createProduct);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateProduct);
router.delete('/:id', requireRole('ADMIN', 'ACCOUNTANT'), archiveProduct);

export default router;
