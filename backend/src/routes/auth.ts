import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validate, signupSchema, loginSchema, syncSchema } from '../middleware/validation';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/sync', authMiddleware, validate(syncSchema), authController.sync);
router.get('/me', authMiddleware, authController.me);

export default router;
