import { Router } from 'express';
import { checkInTicket, createTicket, getAllTickets, getUserTickets} from '../controllers/ticketController';

const router = Router();

router.post('/create', createTicket);
router.post('/check-in/:ticketId/:adminId', checkInTicket);
router.get("/all/:adminId", getAllTickets);
router.get("/:userId", getUserTickets);

export default router;