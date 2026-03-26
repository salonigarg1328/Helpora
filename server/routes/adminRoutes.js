import express from 'express';
import {
  getUnverifiedNgos,
  verifyNgo,
  getStats,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/ngos/unverified', getUnverifiedNgos);
router.patch('/verify/:id', verifyNgo);
router.get('/stats', getStats);

export default router;