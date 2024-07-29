import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username: string;
  discord_id?: string;
  ucsd_affiliation?: string;
  pronouns?: string;
  year?: string;
  major?: string;
  is_active: boolean;
  events_attended: number;
  time_spent_at_events: number;
  get_id(): string;
  to_dict(): Record<string, any>;
}

interface IUserModel extends Model<IUser> {
  updateEventsAttended(userId: string, numEvents: number): Promise<number>;
  findByDiscordId(discordId: string): Promise<IUser | null>;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  discord_id: { type: String },
  ucsd_affiliation: { type: String },
  pronouns: { type: String },
  year: { type: String },
  major: { type: String },
  is_active: { type: Boolean, default: true, required: true },
  events_attended: { type: Number, default: 0 },
  time_spent_at_events: { type: Number, default: 0, required: true }
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
    ucsd_affiliation: this.ucsd_affiliation,
    pronouns: this.pronouns,
    year: this.year,
    major: this.major,
    account_created_date: this.createdAt,
    events_attended: this.events_attended,
  };
};

UserSchema.statics.findByDiscordId = async function (discordId: string): Promise<IUser | null> {
  const userDoc = await this.findOne({ discord_id: discordId });
  return userDoc;
};

const User = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
