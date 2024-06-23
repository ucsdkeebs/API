import { Request, Response } from 'express';
import User from '../models/userModel';

export const createUser = async (req: Request, res: Response) => {
  const { email, username, discord_id, profile_picture, ucsd_affiliation, pronouns, year, major } = req.body;
  try {
    const user = new User({ email, username, discord_id, profile_picture, ucsd_affiliation, pronouns, year, major });
    const result = await user.save();
    res.status(201).json({ userId: result._id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

export const getUserByDiscordId = async (req: Request, res: Response) => {
  const { discord_id } = req.params;
  try {
    const user = await User.find_by_discord_id(discord_id);
    if (user) {
      res.status(200).json(user.to_dict());
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
};

export const updateEventsAttended = async (req: Request, res: Response) => {
  const { userId, numEvents } = req.body;
  try {
    const result = await User.update_events_attended(userId, numEvents);
    res.status(200).json({ modifiedCount: result });
  } catch (error) {
    res.status(500).json({ error: 'Error updating events attended' });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users' });
  }
};