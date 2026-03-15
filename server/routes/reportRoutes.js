import express from 'express';
import {
  createReport,
  getNearbyReports,
  acceptReport,
  resolveReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All report routes require authentication
router.use(protect);

// Victim-only: create a report
router.post('/', authorize('victim'), createReport);

// NGO-only: get nearby reports
router.get('/nearby', authorize('ngo'), getNearbyReports);

// NGO-only: accept a report
router.patch('/:id/accept', authorize('ngo'), acceptReport);

// NGO or admin: resolve a report
router.patch('/:id/resolve', authorize('ngo', 'admin'), resolveReport);

export default router;