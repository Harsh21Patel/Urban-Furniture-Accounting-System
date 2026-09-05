import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listBudgets,
  getBudget,
  createBudget,
  confirmBudget,
  reviseBudget,
  cancelBudget,
  getBudgetTransactions,
} from '../controllers/budget.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listBudgets);
router.get('/:id', getBudget);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createBudget);
router.post('/:id/confirm', requireRole('ADMIN', 'ACCOUNTANT'), confirmBudget);
router.post('/:id/revise', requireRole('ADMIN', 'ACCOUNTANT'), reviseBudget);
router.post('/:id/cancel', requireRole('ADMIN', 'ACCOUNTANT'), cancelBudget);
router.get('/:id/transactions', getBudgetTransactions);

export default router;
