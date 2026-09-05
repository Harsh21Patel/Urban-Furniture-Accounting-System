import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createPurchaseOrder,
  confirmPurchaseOrder,
  listPurchaseOrders,
  convertToBill,
  listVendorBills,
  getVendorBill,
} from '../controllers/purchase.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/orders', listPurchaseOrders);
router.post('/orders', requireRole('ADMIN', 'ACCOUNTANT'), createPurchaseOrder);
router.post('/orders/:id/confirm', requireRole('ADMIN', 'ACCOUNTANT'), confirmPurchaseOrder);
router.post('/orders/:id/bill', requireRole('ADMIN', 'ACCOUNTANT'), convertToBill);

router.get('/bills', listVendorBills);
router.get('/bills/:id', getVendorBill);

export default router;
