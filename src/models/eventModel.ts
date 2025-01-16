import mongoose, { Schema, Document } from 'mongoose';

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
    slot_limit: {type: Number, required: true}
})

// Method to check if an event is currently active or not based on time
EventSchema.method('is_active', function is_active(){
    let currentTime: Date = new Date();
    return (this.end_date >= currentTime && currentTime >= this.start_date);
});

// Method to rsvp_to_event creating ticket, returns a string on if the rsvp was succesful
EventSchema.method('rsvp_to_event', async function rsvp_to_event(
    user: mongoose.Types.ObjectId,  
    raffle_slot: number,
    keyboards: mongoose.Types.ObjectId[],
): Promise<String> {
    // checks if the event is over to prevent late rsvps
    let currentTime: Date = new Date();
    if (currentTime > this.end_date) {
        return `Sorry, ${this.name} is no longer available for registration.`;
    }

    // loads the ticket list with real objects not just ids
    await this.populate('tickets');

    // load checks if the event has had max rsvps
    if (this.tickets.length) {
        return `Sorry, ${this.name} has reached the maximum number of RSVPs.`;
    }

    // check if the raffle slot has full tickets
    const raffleSlotRsvps = this.tickets.filter(ticket =>
        (ticket as any).raffle_slot.equals(raffle_slot)
    )
    if (raffleSlotRsvps.length >= this.slot_limit) {
        return `Sorry, Raffle Slot ${raffle_slot} has reached the maximum number of rsvps, please choose another Raffle Slot`
    }

    // checks if the user has rsvped the max number of times
    const existingRsvps = this.tickets.filter(ticket => 
        (ticket as any).ownerId.equals(user)
    );

    if (existingRsvps.length >= this.ticket_limit) {
        return 'You have reached the maximum number of tickets for this event.'
    }
    
    await this.save();

    if (keyboards)
        this.number_of_keebs += keyboards.length;
    
    await this.save();
    // successful rsvp
    return `Thank You for RSVPing. See you at ${this.name}`;
});

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;