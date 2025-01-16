import Ticket from '../models/ticketModel';
import mongoose from 'mongoose';
import { createKeyboards } from '../services/keyboardServices';

export const createTicketService = async (
    ownerId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    ticketData: any,
    keyboardData: any[]
) => {
    try {
        const keyboards = createKeyboards(keyboardData);

        const newTicket = new Ticket({
            ticket_number: ticketData.ticket_number,
            ownerId: ownerId,
            eventId: eventId,
            first_name: ticketData.first_name,
            last_name: ticketData.last_name,
            keyboards: keyboards,
            gender_identity: ticketData.gender_identity,
            from_where: ticketData.from_where,
            expected_spend: ticketData.expected_spend,
            raffle_slot: ticketData.raffle_slot,
            checked_in: false
        });
        const savedTicket = await newTicket.save();
        return savedTicket;
    } catch (error) {
        throw new Error('failed to create a ticket ' + (error as Error).message);
    }
}