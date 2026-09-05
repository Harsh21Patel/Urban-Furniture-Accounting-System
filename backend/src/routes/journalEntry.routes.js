import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listJournalEntries,
  getJournalEntry,
  createJournalEntry,
  postDraftJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  reverseJournalEntry,
} from '../controllers/journalEntry.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listJournalEntries);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), getJournalEntry);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createJournalEntry);
router.post('/:id/post', requireRole('ADMIN', 'ACCOUNTANT'), postDraftJournalEntry);
router.post('/:id/reverse', requireRole('ADMIN', 'ACCOUNTANT'), reverseJournalEntry);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateJournalEntry);
router.delete('/:id', requireRole('ADMIN', 'ACCOUNTANT'), deleteJournalEntry);

export default router;

