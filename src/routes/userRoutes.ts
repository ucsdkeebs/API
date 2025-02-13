import { Router } from 'express';
import { createUser, getAllUsers } from '../controllers/userController';
import verifyToken from '../middlewares/authMiddleware';

const router = Router();

router.post('/create-user', createUser);

router.get('/get-users', getAllUsers);

router.get('/verify', verifyToken, (req, res) => {
    res.json({ message: "Secure data", user: req.user });
  });


export default router;
