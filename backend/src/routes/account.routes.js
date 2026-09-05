import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  archiveAccount,
} from '../controllers/account.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listAccounts);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), getAccount);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createAccount);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateAccount);
router.delete('/:id', requireRole('ADMIN'), archiveAccount);

export default router;
