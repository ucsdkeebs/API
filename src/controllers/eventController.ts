import { Request, Response } from 'express';
import Event from '../models/eventModel';

export const getAllEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users' });
    }
};

export const getActiveEvents = async (req: Request, res: Response) => {
    try {
        const allEvents = await Event.find();
        const activeEvents = allEvents.filter(event => event.is_active());
        res.status(200).json(activeEvents);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users' });
    }
};

export const createEvent = async (req: Request, res: Response) => {
    try {
        const { 
            name, max_attendees, max_rsvps,
            start_date, end_date 
        } = req.body;
        const newEvent = new Event({ 
            name, max_attendees, max_rsvps,
            start_date, end_date 
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
};

export const rsvpToEvent = async (req: Request, res: Response) => {
    const { eventId, userId, raffleSlot, bringKeeb } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const responseMessage = await event.rsvp_to_event(userId, raffleSlot, bringKeeb);
        res.status(200).json({ message: responseMessage });
    } catch (error) {
        res.status(500).json({ error: 'Error processing RSVP' });
    }
}