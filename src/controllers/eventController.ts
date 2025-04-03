import { Request, Response } from 'express';
import Event from '../models/eventModel';
import mongoose from 'mongoose';
import { createTicketService } from '../services/ticketServices';

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
    const data = {
      name: req.body.name,
      max_attendees: req.body.max_attendees,
      max_rsvps: req.body.max_rsvps,
      start_date: req.body.start_date,
      end_date: req.body.end_date,
      slot_limit: req.body.slot_limit,
      num_slots: req.body.num_slots,
      description: req.body.description,
      image_link: req.body.image_link
    };

    const event = new Event(data);

    console.log(event);

    const result = await event.save();
    console.log('event saved');
    res.status(201).json({ event: result });
  } catch (error) {
    res.status(500).json({ error: 'Error creating event' });
  }
};

export const rsvpToEvent = async (req: Request, res: Response) => {

    try {
        const { userId, ticketData } = req.body;
        const { eventId } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ error: 'Invalid event ID' });
        }
    
        const event = await Event.findById(eventId).populate('tickets');
        if (!event) return res.status(404).json({ error: 'Event not found' });
    
        const currentTime = new Date();
        if (currentTime > event.end_date) {
            return res.status(400).json({ error: `${event.name} is no longer open for RSVP.` });
        }

        const existingTickets = event.tickets || [];
        const availableSlots = event.max_rsvps - existingTickets.length;

        if (ticketData.length > availableSlots) {
            return res.status(400).json({
            error: availableSlots === 0
                ? `${event.name} is full.`
                : `${event.name} only has ${availableSlots} slots left. You requested ${ticketData.length}.`
            });
        }
    
        const userTickets = existingTickets.filter(
            (ticket: any) => ticket.ownerId.toString() === userId
        );
        if (userTickets.length + ticketData.length > event.ticket_limit) {
            return res.status(400).json({
            error: `You can only RSVP for ${event.ticket_limit} tickets. You already have ${userTickets.length}.`
            });
        }

        const eventObjectId = new mongoose.Types.ObjectId(eventId);
        const userObjectId = new mongoose.Types.ObjectId(userId)
    
        const createdTickets = [];
        for (let i = 0; i < ticketData.length; i++) {
            const ticket = await createTicketService(userObjectId, eventObjectId, ticketData[i]/*, keyboardData*/);
            //new TicketModel({ event: eventId, ownerId: userId });
            await ticket.save();
            createdTickets.push(ticket);

        }
   
        res.status(200).json({ message: 'RSVP successful', tickets: createdTickets });
        } catch (err) {
        res.status(500).json({ error: err });
        }
  };

  export const getUserTicketsForEvent = async (req: Request, res: Response) => {
    try {
      const { userId, eventId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(eventId) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: 'Invalid user ID or event ID' });
      }
  
      const event = await Event.findById(eventId).populate('tickets');
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      const userTickets = event.tickets.filter((ticket: any) => ticket.ownerId.toString() === userId);
      
      if (userTickets.length === 0) {
        return res.status(404).json({ error: 'No tickets found for this user' });
      }
  
      res.status(200).json({ tickets: userTickets });
  
    } catch (error) {
      console.error('Error retrieving user tickets:', error);
      res.status(500).json({ error: 'Error retrieving user tickets' });
    }
  };