import { Router } from 'express';
import { boardController } from '../controllers/boardController';
import { authMiddleware } from '../middleware/auth';
import {
    validate,
    createBoardSchema,
    updateBoardSchema,
    addMemberSchema,
} from '../middleware/validation';

const router = Router();

router.use(authMiddleware);

router.get('/', boardController.getAll);
router.post('/', validate(createBoardSchema), boardController.create);
router.get('/:id', boardController.getById);
router.put('/:id', validate(updateBoardSchema), boardController.update);
router.delete('/:id', boardController.delete);
router.post('/:id/members', validate(addMemberSchema), boardController.addMember);
router.delete('/:id/members/:userId', boardController.removeMember);
router.put('/:id/members/:userId/role', boardController.updateMemberRole);
router.get('/:id/activities', boardController.getActivities);

export default router;
