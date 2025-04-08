import { Router } from 'express';
import { checkInTicket, createTicket, getAllTickets} from '../controllers/ticketController';

const router = Router();

router.post('/create', createTicket);
router.post('/check-in/:ticketId/:adminId', checkInTicket);
router.get("/all/:adminId", getAllTickets);

export default router;