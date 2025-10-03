import { Router } from 'express';
import { 
    createNotice, 
    getNotices, 
    getNoticeById, 
    updateNotice, 
    deleteNotice 
} from '../controllers/notices.controllers.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { adminMiddleware } from '../middlewares/admin.middleware.js';
import upload from '../middlewares/upload.middleware.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for file uploads
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 uploads per windowMs
    message: {
        status: 'error',
        message: 'Too many uploads. Please try again later.'
    }
});

// Public routes
router.get('/', getNotices); // Allow public access to notices

// Protected routes - require authentication
router.use(authMiddleware);

// Routes with file upload
router.post('/create', uploadLimiter, upload.single('attachment'), createNotice);
router.put('/:id', upload.single('attachment'), updateNotice);

// Other protected routes
router.get('/:id', getNoticeById);
router.delete('/:id', deleteNotice);

// Admin only routes
router.use(adminMiddleware);
router.delete('/admin/bulk-delete', async (req, res, next) => {
    try {
        const { ids } = req.body;
        await Notice.deleteMany({ _id: { $in: ids } });
        res.status(200).json({
            success: true,
            message: 'Notices deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;