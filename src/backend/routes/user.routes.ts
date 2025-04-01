import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/UserRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post('/', requireRole([UserRole.ADMIN]), createUser);
router.get('/', requireRole([UserRole.ADMIN]), getUsers);
router.get('/:userId', getUserById);
router.put('/:userId', requireRole([UserRole.ADMIN]), updateUser);
router.delete('/:userId', requireRole([UserRole.ADMIN]), deleteUser);

export default router; 