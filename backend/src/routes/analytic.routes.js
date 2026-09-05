import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { listAnalytics, getAnalytic, createAnalytic } from '../controllers/analytic.controller.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole('ADMIN', 'ACCOUNTANT'), listAnalytics);
router.get('/:id', requireRole('ADMIN', 'ACCOUNTANT'), getAnalytic);
router.post('/', requireRole('ADMIN', 'ACCOUNTANT'), createAnalytic);

export default router;
