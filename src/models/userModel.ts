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

UserSchema.methods.to_dict = function (): Record<string, any> {
  return {
    email: this.email,
    username: this.username,
    discord_id: this.discord_id,
    profile_picture: this.profile_picture,
    ucsd_affiliation: this.ucsd_affiliation,
    pronouns: this.pronouns,
    year: this.year,
    major: this.major,
    account_created_date: this.account_created_date,
    events_attended: this.events_attended,
  };
};

UserSchema.statics.update_events_attended = async function (userId: string, numEvents: number = 1): Promise<number> {
  const result = await this.updateOne(
    { _id: userId },
    { $inc: { events_attended: numEvents } }
  );
  return result.modifiedCount;
};

UserSchema.statics.find_by_discord_id = async function (discordId: string): Promise<IUser | null> {
  const userDoc = await this.findOne({ discord_id: discordId });
  return userDoc;
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
