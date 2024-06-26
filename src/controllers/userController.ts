import { Request, Response } from 'express';
import User from '../models/userModel';

export const createUser = async (req: Request, res: Response) => {
  const { email, username, discord_id, ucsd_affiliation, pronouns, year, major } = req.body;
  try {
    const user = new User({ email, username, discord_id, ucsd_affiliation, pronouns, year, major });
    const result = await user.save();
    res.status(201).json({ userId: result._id });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
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