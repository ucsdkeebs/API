import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
    name: string;
    max_attendees: number;
    max_rsvps: number;
    number_of_keebs: number;
    start_date: Date;
    end_date: Date;
    rsvp_users: mongoose.Types.ObjectId[];
    current_attendees: mongoose.Types.ObjectId[];
    raffle_winners?: mongoose.Types.ObjectId[];
    is_active(): boolean;
    rsvp_to_event(user: mongoose.Types.ObjectId, bringKeeb: boolean): string;
}

const EventSchema: Schema<IEvent> = new Schema ({
    name: {type: String, required: true},
    max_attendees: {type: Number, required: true},
    max_rsvps: {type: Number, required: true},
    number_of_keebs: {type: Number, default: 0},
    start_date: {type: Date, required: true},
    end_date: {type: Date, required: true},
    rsvp_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, default: []}],
    current_attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, default: []}],
    raffle_winners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: []}],
})

EventSchema.method('is_active', function is_active(){
    let currentTime: Date = new Date();
    return (this.end_date >= currentTime && currentTime >= this.start_date);
});

EventSchema.method('rsvp_to_event', async function is_active(user, bringKeeb){
    let currentTime: Date = new Date();
    if (this.end_date >= currentTime) {
        if (this.max_rsvps > this.rsvp_users.length) {
            this.rsvp_users.push(user);
            if (bringKeeb)
                this.number_of_keebs++;
            await this.save();
            return `Thank You for RSVPing. See you at ${this.name}`;
        } else {
            return `Sorry, ${this.name} has reached the maximum number of RSVPs.`;
        }
    } else {
        return `Sorry, ${this.name} is no longer available for registration.`;
    }
});

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;