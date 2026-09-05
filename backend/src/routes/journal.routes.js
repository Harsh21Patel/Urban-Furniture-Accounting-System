import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { listJournals, getJournal, createJournal } from '../controllers/journal.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listJournals);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), getJournal);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createJournal);

export default router;
