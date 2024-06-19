import { Request, Response } from 'express';
import User from '../models/userModel';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
      const { 
        username, email, discord_id, 
        ucsd_affiliation, pronouns, year, major 
      } = req.body;
      const newUser = new User({ 
        username, email, discord_id, 
        ucsd_affiliation, pronouns, year, major 
      });
      await newUser.save();
      res.status(201).json(newUser);
  } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
  }
};