import { Router } from 'express';
import { taskController } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';
import {
    validate,
    createTaskSchema,
    updateTaskSchema,
    moveTaskSchema,
    assignTaskSchema,
} from '../middleware/validation';

const router = Router();

router.use(authMiddleware);

router.post('/', validate(createTaskSchema), taskController.create);
router.put('/:id', validate(updateTaskSchema), taskController.update);
router.put('/:id/move', validate(moveTaskSchema), taskController.move);
router.delete('/:id', taskController.delete);
router.post('/:id/assign', validate(assignTaskSchema), taskController.assign);
router.delete('/:id/assign/:userId', taskController.unassign);

export default router;
