import { Router } from 'express';
import { createUser, deleteUser, getAllUsers } from '../controllers/userController';
import verifyToken from '../middlewares/authMiddleware';
import User from '@/models/userModel';

const router = Router();

router.post('/create-user', createUser);

router.get('/get-users', getAllUsers);

router.delete('/delete-user', deleteUser);

router.get('/verify', verifyToken, (req, res) => {
    res.json({ message: "Secure data", user: req.user });
  });

export default router;
