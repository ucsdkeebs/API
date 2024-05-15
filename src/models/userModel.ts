import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  username?: string;
  discord_id?: string;
  profile_picture?: string;
  ucsd_affiliation?: string;
  pronouns?: string;
  year?: string;
  major?: string;
  is_active: boolean;
  account_created_date: Date;
  events_attended: number;
  get_id(): string;
  to_dict(): Record<string, any>;
}

interface IUserModel extends Model<IUser> {
  find_by_discord_id(discordId: string): Promise<IUser | null>;
  update_events_attended(userId: string, numEvents: number): Promise<number>;
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true },
  username: { type: String },
  discord_id: { type: String },
  profile_picture: { type: String },
  ucsd_affiliation: { type: String },
  pronouns: { type: String },
  year: { type: String },
  major: { type: String },
  is_active: { type: Boolean, default: true },
  account_created_date: { type: Date, default: Date.now },
  events_attended: { type: Number, default: 0 },
});

UserSchema.methods.get_id = function (): string {
  return this.discord_id;
};

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

const User: IUserModel = mongoose.model<IUser, IUserModel>('User', UserSchema);
export default User;
