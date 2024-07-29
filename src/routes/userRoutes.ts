import { Router } from 'express';
import { createUser, getUserByDiscordId, getAllUsers } from '../controllers/userController';

const router = Router();

router.post('/create-user', createUser);
router.get('/get-users', getAllUsers);
router.get('/:discord_id', getUserByDiscordId);


export default router;
