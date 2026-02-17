import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authMiddleware as authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.delete);

export default router;
