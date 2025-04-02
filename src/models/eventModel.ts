import mongoose, { Schema, Document } from 'mongoose';
import Ticket from './ticketModel';

//Interface for Events
export interface IEvent extends Document {
    name: string;
    max_attendees: number;
    max_rsvps: number;
    number_of_keebs: number;
    start_date: Date;
    end_date: Date;
    tickets: mongoose.Types.ObjectId[];
    raffle_winners?: mongoose.Types.ObjectId[];
    ticket_limit: number;
    slot_limit: number;
    num_slots: number;
    description: string;
    image_link: string;
    is_active(): boolean;
    rsvp_to_event(user: mongoose.Types.ObjectId, raffle_slot: number, keyboards: mongoose.Types.ObjectId[]): Promise<string>;
}

//Schema for Events
const EventSchema: Schema<IEvent> = new Schema ({
    name: {type: String, required: true},
    max_attendees: {type: Number, required: true},
    max_rsvps: {type: Number, required: true},
    number_of_keebs: {type: Number, default: 0},
    start_date: {type: Date, required: true},
    end_date: {type: Date, required: true},
    tickets: [{type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: []}],
    raffle_winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: []}],
    ticket_limit: {type: Number, required: false, default: 5},
    slot_limit: {type: Number, required: true},
    num_slots: {type: Number, required: true},
    description: {type: String, required: false},
    image_link: {type: String, required: false}
})

// Method to check if an event is currently active or not based on time
EventSchema.method('is_active', function is_active(){
    let currentTime: Date = new Date();
    return (this.end_date >= currentTime && currentTime >= this.start_date);
});

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;