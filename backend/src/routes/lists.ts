import { Router } from 'express';
import { listController } from '../controllers/listController';
import { authMiddleware } from '../middleware/auth';
import { validate, createListSchema, updateListSchema } from '../middleware/validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createListSchema), listController.create);
router.put('/:id', validate(updateListSchema), listController.update);
router.delete('/:id', listController.delete);

export default router;
