import { Router } from 'express';
import { updateWinner, getCheckedInNoWinTickets, getCheckedInTickets, getCheckedInByRaffleSlot } from '../controllers/webHooks/ticketTailorController';
import requireAdmin from '../middlewares/adminMiddleware'

const router = Router();

router.post('/update-winner/:ticketId', requireAdmin, updateWinner);
router.get('/get-checked-in-no-win', requireAdmin, getCheckedInNoWinTickets);
router.get('/get-checked-in', requireAdmin, getCheckedInTickets);
router.get('/get-checked-in-by-raffle', requireAdmin, getCheckedInByRaffleSlot);

export default router;