import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authMiddleware as any);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.get('/search', userController.search);

export default router;
