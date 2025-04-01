import Ticket from '../models/ticketModel';
import mongoose from 'mongoose';
import { createKeyboards } from '../services/keyboardServices';

export const createTicketService = async (
    ownerId: mongoose.Types.ObjectId,
    eventId: mongoose.Types.ObjectId,
    ticketData: any,
    //keyboardData: any[]
) => {
    try {
        //const keyboards = createKeyboards(keyboardData);

        const newTicket = new Ticket({
            ownerId: ownerId,
            eventId: eventId,
            first_name: ticketData.first_name,
            last_name: ticketData.last_name,
            //keyboards: keyboards,
            gender_identity: ticketData.gender_identity,
            from_where: ticketData.from_where,
            expected_spend: ticketData.expected_spend,
            raffle_slot: ticketData.raffle_slot,
            checked_in: false
        });

        console.log('creating ticket!');

        const savedTicket = await newTicket.save();

        console.log('ticket created succesfully!');
        console.log(newTicket);

        return savedTicket;
    } catch (error) {
        console.log(error);
        throw new Error('failed to create a ticket ' + (error as Error).message);
    }
}