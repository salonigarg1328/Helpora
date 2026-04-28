import express from 'express';
import {
  getMyResources,
  addResource,
  updateResource,
  deleteResource,
} from '../controllers/resourceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All resource routes require authentication and NGO role
router.use(protect, authorize('ngo'));

router.get('/me', getMyResources);
router.post('/', addResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;