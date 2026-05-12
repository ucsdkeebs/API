import { Router } from 'express';
import { updateWinner, getCheckedInNoWinTickets, getCheckedInTickets } from '../controllers/webHooks/ticketTailorController';
import requireAdmin from '../middlewares/adminMiddleware'

const router = Router();

router.post('/update-winner', requireAdmin, updateWinner);
router.get('/get-checked-in-no-win', requireAdmin, getCheckedInNoWinTickets);
router.get('/get-checked-in', requireAdmin, getCheckedInTickets);

export default router;