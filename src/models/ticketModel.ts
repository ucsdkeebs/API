    import mongoose, { Schema, Document } from 'mongoose';

    export interface ITicket extends Document {
        ownerId: mongoose.Types.ObjectId;
        eventId: mongoose.Types.ObjectId;
        first_name: string;
        last_name: string;
        //keyboards: mongoose.Types.ObjectId[];
        gender_identity: string;
        from_where: string;
        expected_spend: string;
        checked_in: boolean;
        raffle_slot: number;
    }

    const TicketSchema: Schema<ITicket> = new Schema ({
        ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        eventId: {type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},
        first_name: {type: String, required: true},
        last_name: {type: String, required: true },
        //keyboards: [{type: mongoose.Schema.Types.ObjectId, ref: 'Keyboard', required: true, default: []}],
        from_where: {type: String, required: true},
        expected_spend: {type: String, required: true},
        checked_in: {type: Boolean, required: true, default: false},
        raffle_slot: {type: Number, required: true}
    })

    const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
    export default Ticket;