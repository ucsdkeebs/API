import { Request, Response } from 'express';
import { createKeyboards } from '../services/keyboardServices';

export const createKeyboard = async (req: Request, res: Response) => {
    const { keyboards } = req.body;

    if (!keyboards || !Array.isArray(keyboards)) {
        return res.status(400).json({ error: 'Invalid input: keyboards must be an array' });
    }

    try {
        const createdKeyboardIds = await createKeyboards(keyboards);
        res.status(201).json({ message: 'Keyboards created successfully', keyboardIds: createdKeyboardIds });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
