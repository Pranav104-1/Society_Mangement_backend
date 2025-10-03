import { Router } from 'express';
import { 
    createComplaint, 
    getAllComplaints,
    getComplaintById,
    updateComplaint,
    deleteComplaint,
    addComment,
    updateStatus
} from '../controllers/complaint.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';

const router = Router();

// User routes
router.post('/create', authMiddleware, createComplaint);
router.get('/my-complaints', authMiddleware, getAllComplaints);
router.get('/:id', authMiddleware, getComplaintById);
router.post('/:id/comment', authMiddleware, addComment);
router.put('/:id', authMiddleware, updateComplaint);

// Admin routes
router.get('/all', [authMiddleware, isAdmin], getAllComplaints);
router.put('/:id/status', [authMiddleware, isAdmin], updateStatus);
router.delete('/:id', [authMiddleware, isAdmin], deleteComplaint);

export default router;