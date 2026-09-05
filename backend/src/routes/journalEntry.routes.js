import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { listJournalEntries, createJournalEntry } from '../controllers/journalEntry.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listJournalEntries);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createJournalEntry);

export default router;
