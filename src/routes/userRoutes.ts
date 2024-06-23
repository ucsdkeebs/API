import { Router } from 'express';
import { createUser, getUserByDiscordId, updateEventsAttended, getAllUsers } from '../controllers/userController';

const router = Router();

router.post('/create', createUser);
router.get('/get-users', getAllUsers);
router.get('/:discord_id', getUserByDiscordId);
router.put('/update-events', updateEventsAttended);


export default router;
