import { Router } from 'express';

import {
    getAllEvents,
    getActiveEvents,
    createEvent,
    rsvpToEvent,
    getUserTicketsForEvent
} from '../controllers/eventController';

const router = Router();

router.get('/all', getAllEvents);

router.get('/get-active', getActiveEvents);

router.post('/get-user-tickets', getUserTicketsForEvent);

router.post('/create-event', createEvent);

router.post('/:eventId/rsvp', rsvpToEvent);

export default router;
