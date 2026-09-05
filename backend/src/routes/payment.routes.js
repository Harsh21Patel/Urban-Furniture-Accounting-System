import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { payInvoice, payBill, listPayments } from '../controllers/payment.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listPayments);
router.post('/invoice', requireRole('ADMIN', 'ACCOUNTANT', 'CONTACT_USER'), payInvoice);
router.post('/bill', requireRole('ADMIN', 'ACCOUNTANT'), payBill);

export default router;
