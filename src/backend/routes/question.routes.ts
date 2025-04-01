import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionsByCategory,
} from '../controllers/question.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/UserRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin-only routes
router.post('/', requireRole([UserRole.ADMIN]), createQuestion);
router.get('/', requireRole([UserRole.ADMIN]), getQuestions);
router.put('/:questionId', requireRole([UserRole.ADMIN]), updateQuestion);
router.delete('/:questionId', requireRole([UserRole.ADMIN]), deleteQuestion);

// Routes accessible by both admin and candidate
router.get('/:questionId', getQuestionById);
router.get('/category/:category', getQuestionsByCategory);

export default router; 