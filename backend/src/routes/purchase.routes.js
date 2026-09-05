import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createPurchaseOrder,
  listPurchaseOrders,
  convertToBill,
} from '../controllers/purchase.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/orders', listPurchaseOrders);
router.post('/orders', requireRole('ADMIN', 'ACCOUNTANT'), createPurchaseOrder);
router.post('/orders/:id/bill', requireRole('ADMIN', 'ACCOUNTANT'), convertToBill);

export default router;
