import { Router } from 'express';
import { createKeyboard } from '../controllers/keyboardController';

const router = Router();

router.post('/create', createKeyboard);

export default router;