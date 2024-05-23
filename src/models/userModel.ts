import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string; // do we need email and discord?
  username: string;
  discord_id: string;
  //profile_picture?: string;
  ucsd_affiliation: string;
  pronouns?: string;
  year?: string;
  major?: string;
  is_active: boolean;
  events_attended: number;
  time_spent_at_events: number;
  get_id(): string;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  discord_id: { type: String, required: true },
  //profile_picture: { type: String }, //not sure we should be doing images and stuff
  ucsd_affiliation: { type: String, required: true },
  pronouns: { type: String }, //might need to change to gender identity
  year: { type: String },
  major: { type: String }, //not sure if we're gonna collect this
  is_active: { type: Boolean, default: true, required: true },
  events_attended: { type: Number, default: 0 },
  time_spent_at_events: {type: Number, default: 0, required: true}
}, {
  timestamps: true
});

UserSchema.method('get_id', function get_id() {
  return this.discord_id;
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;