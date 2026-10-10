import { Router } from 'express';
import { checkInTicket, createTicket, getAllTickets, getUserTickets} from '../controllers/ticketController';
import requireAdmin from '../middlewares/adminMiddleware'

const router = Router();

router.post('/create', createTicket);
router.post('/check-in/:ticketId', requireAdmin, checkInTicket);
router.get("/all", requireAdmin, getAllTickets);
router.get("/:userId", requireAdmin, getUserTickets);

export default router;