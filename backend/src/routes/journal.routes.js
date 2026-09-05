import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
} from '../controllers/journal.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listJournals);
router.get('/:id', getJournal);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createJournal);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateJournal);

export default router;
