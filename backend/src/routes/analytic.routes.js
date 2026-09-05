import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  listAnalytics,
  getAnalytic,
  createAnalytic,
  updateAnalytic,
} from '../controllers/analytic.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', listAnalytics);
router.get('/:id', getAnalytic);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createAnalytic);
router.put('/:id', requireRole('ADMIN', 'ACCOUNTANT'), updateAnalytic);

export default router;
