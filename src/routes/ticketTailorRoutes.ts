import { Router } from 'express';
import { updateWinner, getCheckedInNoWinTickets, getCheckedInTickets } from '../controllers/webHooks/ticketTailorController';
import requireAdmin from '../middlewares/adminMiddleware'

const router = Router();

router.post('/update-winner/:adminId', requireAdmin, updateWinner);
router.get('/get-checked-in-no-win/:adminId', requireAdmin, getCheckedInNoWinTickets);
router.get('/get-checked-in/:adminId', requireAdmin, getCheckedInTickets);

export default router;