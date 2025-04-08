import { Request, Response } from 'express';
import Ticket from '../models/ticketModel';
import User from '@/models/userModel';
import { createTicketService } from '../services/ticketServices';

//Create Ticket handles only the http response, actual ticket creation logic delegated to services
export const createTicket = async (
  req: Request, res: Response
) => {
    const { ownerId, eventId, first_name, last_name, keyboards, gender_identity, from_where, expected_spend, checked_in } = req.body;
    try {
      const ticket = await createTicketService(
        ownerId, 
        eventId,
        { 
          ownerId, eventId, 
          first_name, 
          last_name, 
          keyboards, 
          gender_identity, 
          from_where, 
          expected_spend, 
          checked_in 
        },
        //keyboards
      );

      res.status(201).json({ ticketId: ticket._id });
    } catch (error) {
      res.status(500).json({ error: 'Error creating ticket' });
    }
  };

  // Checks in ticket for event
  export const checkInTicket = async (req: Request, res: Response) => {
    const { ticketId, adminId } = req.params;
  
    try {
      const user = await User.findById(adminId);
      if (!user || !user.admin) {
        return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
      }
  
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
  
      ticket.checked_in = true;
      await ticket.save();
  
      res.status(200).json({ message: 'User checked in successfully', ticket });
    } catch (error) {
      res.status(500).json({ error: 'Error checking in user' });
    }
  };

// Get all tickets (admin-only)
export const getAllTickets = async (req: Request, res: Response) => {
  const { adminId } = req.params;

  try {
    const user = await User.findById(adminId);
    if (!user || !user.admin) {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const tickets = await Ticket.find();
    res.status(200).json({ tickets });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tickets' });
  }
};