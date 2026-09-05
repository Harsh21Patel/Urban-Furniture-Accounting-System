import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createSalesOrder,
  confirmSalesOrder,
  listSalesOrders,
  generateInvoice,
} from '../controllers/sales.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/orders', listSalesOrders);
router.post('/orders', requireRole('ADMIN', 'ACCOUNTANT'), createSalesOrder);
router.post('/orders/:id/confirm', requireRole('ADMIN', 'ACCOUNTANT'), confirmSalesOrder);
router.post('/orders/:id/invoice', requireRole('ADMIN', 'ACCOUNTANT'), generateInvoice);

export default router;
