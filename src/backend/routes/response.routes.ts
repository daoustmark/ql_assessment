import { Router } from 'express';
import {
  submitResponse,
  getResponses,
  getResponseById,
  getSessionResponses,
  getCandidateResponses,
} from '../controllers/response.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/UserRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.get('/', requireRole([UserRole.ADMIN]), getResponses);

// Routes accessible by both admin and candidate
router.post('/', submitResponse);
router.get('/:responseId', getResponseById);
router.get('/session/:sessionId', getSessionResponses);
router.get('/candidate/:candidateId', getCandidateResponses);

export default router; 