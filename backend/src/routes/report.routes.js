import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  balanceSheet,
  profitAndLoss,
  budgetReport,
  ledgerReport,
  journalReport,
} from '../controllers/report.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/balance-sheet', requireRole('ADMIN', 'ACCOUNTANT'), balanceSheet);
router.get('/profit-loss', requireRole('ADMIN', 'ACCOUNTANT'), profitAndLoss);
router.get('/budget', requireRole('ADMIN', 'ACCOUNTANT'), budgetReport);
router.get('/ledger', requireRole('ADMIN', 'ACCOUNTANT'), ledgerReport);
router.get('/journal', requireRole('ADMIN', 'ACCOUNTANT'), journalReport);

export default router;
