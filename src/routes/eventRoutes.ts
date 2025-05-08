import { Router } from 'express';
import requireAdmin from '../middlewares/adminMiddleware'

import {
    getAllEvents,
    getActiveEvents,
    createEvent,
    rsvpToEvent,
    getUserTicketsForEvent
} from '../controllers/eventController';

const router = Router();

router.get('/all', requireAdmin, getAllEvents);

router.get('/get-active', getActiveEvents);

router.post('/get-user-tickets', requireAdmin, getUserTicketsForEvent);

router.post('/create-event', requireAdmin, createEvent);

router.post('/:eventId/rsvp', rsvpToEvent);

export default router;
