import express from 'express';
import { getRecommendations } from '../controllers/reportController.js';
import {
  createReport,
  getNearbyReports,
  acceptReport,
  resolveReport,
  getMyReports,           
  getMyAcceptedReports, 
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
router.get('/:reportId/recommendations', protect, authorize('ngo'), getRecommendations);
router.get('/my-reports', protect, authorize('victim'), getMyReports);
router.get('/my-accepted', protect, authorize('ngo'), getMyAcceptedReports);
export default router;