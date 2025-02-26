import { Request, Response } from 'express';
import User from '../models/userModel';
import Ticket from '../models/ticketModel';

export const createUser = async (req: Request, res: Response) => {
  const { email, username, ucsd_affiliation, pronouns, year, major } = req.body;
  try {
    const user = new User({ email, username, ucsd_affiliation, pronouns, year, major });
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
    res.status(500).json({ error: 'Error retrieving users.' });
  }
};

export const checkInToEvent = async (req: Request, res: Response) => {
  const { userId, eventId } = req.body;

  try { 
    const ticket = await Ticket.findOneAndUpdate(
      { userId, eventId, check_in: false },
      { $set: { check_in: true } },
      { new: true }
    );

    if (!ticket) {
      return res.status(400).json({ message: 'No RSVP found for check-in or already checked in.' });
    }

    res.status(200).json({ message: 'Check-in succesful.' });
  } catch (error) {
    res.status(500).json({ message: 'Error checking in.', error})
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    const result = await User.deleteOne({uid: uid});

    if (!result) {
      return res.status(400).json({ message: 'No user found.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user.', error})
  }
};