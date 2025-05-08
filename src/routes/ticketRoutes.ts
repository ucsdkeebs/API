import { Router } from 'express';
import { checkInTicket, createTicket, getAllTickets, getUserTickets} from '../controllers/ticketController';
import requireAdmin from '../middlewares/adminMiddleware'

const router = Router();

router.post('/create', createTicket);
router.post('/check-in/:ticketId/:adminId', checkInTicket);
router.get("/all/:adminId", requireAdmin, getAllTickets);
router.get("/:userId", requireAdmin, getUserTickets);

export default router;