import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITicketTailorTicket extends Document {
    ticketTailorId: string;
    eventId: string;
    full_name: string;
    email: string;
    checked_in: boolean;
    raffle_slot: number; //comes from custom_questions field in Ticket Tailor
    won: boolean; //checks if the ticket has won something from the raffle yet
}

const TicketTailorTicketSchema: Schema<ITicketTailorTicket> = new Schema ({
    ticketTailorId: {type: String, required: true, unique: true},
    eventId: {type: String, required: true},
    full_name: {type: String, required: true},
    email: {type: String, required: true},
    checked_in: {type: Boolean, required: true, default: false},
    raffle_slot: {type: Number, required: true},
    won: {type: Boolean, required: true, default: false}
})

TicketTailorTicketSchema.index({ eventId: 1, checked_in: 1 });

const TicketTailorTicket = mongoose.model<ITicketTailorTicket>('TicketTailorTicket', TicketTailorTicketSchema);
export default TicketTailorTicket;