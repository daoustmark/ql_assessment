import { Router } from 'express';
import {
  getUploadUrl,
  getDownloadUrl,
  deleteVideo,
  getVideoUrl,
} from '../controllers/video.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../models/UserRole';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by both admin and candidate
router.post('/upload-url', getUploadUrl);
router.get('/download-url/:key', getDownloadUrl);
router.get('/url/:key', getVideoUrl);

// Admin-only routes
router.delete('/:key', requireRole([UserRole.ADMIN]), deleteVideo);

export default router; 