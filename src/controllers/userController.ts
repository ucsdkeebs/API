import { Request, Response } from 'express';
import User from '../models/userModel';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users.map(user => user.to_dict()));
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users' });
  }
};