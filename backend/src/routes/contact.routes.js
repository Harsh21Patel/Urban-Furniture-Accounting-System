import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listContacts,
  getContact,
  createContact,
  updateContact,
  archiveContact,
  unarchiveContact,
} from '../controllers/contact.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listContacts);
router.get('/:id', getContact);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createContact);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateContact);
router.delete('/:id', requireRole('ADMIN'), archiveContact);
router.post('/:id/unarchive', requireRole('ADMIN'), unarchiveContact);

export default router;
