import { ticketTailorWebhookAuth } from '@/middlewares/webHooks/ticketTailorMiddleware';
import { Router } from 'express';
import { addCheckedInTicket } from '../../controllers/webHooks/ticketTailorController';

const router = Router();

router.post('/ticket-update-secret', ticketTailorWebhookAuth, addCheckedInTicket);

export default router;