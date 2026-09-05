import { Router } from 'express';
import { signup, createUser, login, getMe, listUsers } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/create-user', requireAuth, requireRole('ADMIN'), createUser);
router.get('/users', requireAuth, requireRole('ADMIN'), listUsers);

export default router;
