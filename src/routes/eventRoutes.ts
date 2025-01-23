import { Router } from 'express';

import {
    getAllEvents,
    getActiveEvents,
    createEvent,
    rsvpToEvent
} from '../controllers/eventController';

const router = Router();

router.get('/all', getAllEvents);

router.get('/get-active', getActiveEvents);

router.post('/create', createEvent);

router.post('/rsvp', rsvpToEvent);

export default router;
