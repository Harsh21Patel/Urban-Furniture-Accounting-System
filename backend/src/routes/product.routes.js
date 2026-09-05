import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  archiveProduct,
  unarchiveProduct,
} from '../controllers/product.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listProducts);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), getProduct);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createProduct);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateProduct);
router.delete('/:id', requireRole('ADMIN'), archiveProduct);
router.post('/:id/unarchive', requireRole('ADMIN'), unarchiveProduct);

export default router;
