import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { balanceSheet, profitAndLoss, budgetReport } from '../controllers/report.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/balance-sheet', balanceSheet);
router.get('/profit-loss', profitAndLoss);
router.get('/budget', budgetReport);

export default router;
