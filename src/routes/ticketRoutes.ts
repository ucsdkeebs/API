import { Router } from 'express';
import { createTicket } from '../controllers/ticketController';

const router = Router();

router.post('/create', createTicket);

export default router;