import { Router } from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  getCandidateSessions,
} from '../controllers/session.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/UserRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post('/', requireRole([UserRole.ADMIN]), createSession);
router.get('/', requireRole([UserRole.ADMIN]), getSessions);

// Routes accessible by both admin and candidate
router.get('/:sessionId', getSessionById);
router.put('/:sessionId', updateSession);
router.get('/candidate/:candidateId', getCandidateSessions);

export default router; 