import { Request, Response } from 'express';
import Ticket from '../models/ticketModel';
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
