import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  ucsd_affiliation?: boolean;
  pronouns?: string;
  year?: string;
  major?: string;
  events_attended: number;
  time_spent_at_events: number;
  uid: string;
  admin: boolean;
  to_dict(): Record<string, any>;
}

interface IUserModel extends Model<IUser> {
  updateEventsAttended(userId: string, numEvents: number): Promise<number>;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  ucsd_affiliation: { type: Boolean },
  pronouns: { type: String },
  year: { type: String },
  major: { type: String },
  uid: { type: String, required: true, unique: true},
  admin: {type: Boolean, default: false},
  //is_active: { type: Boolean, default: true, required: true },
  events_attended: { type: Number, default: 0 },
  time_spent_at_events: { type: Number, default: 0, required: true }
}, {
  timestamps: true
});

UserSchema.methods.to_dict = function (): Record<string, any> {
  return {
    email: this.email,
    username: this.username,
    ucsd_affiliation: this.ucsd_affiliation,
    pronouns: this.pronouns,
    year: this.year,
    major: this.major,
    account_created_date: this.createdAt,
    events_attended: this.events_attended,
  };
};

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
