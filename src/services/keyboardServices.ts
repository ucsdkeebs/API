import Keyboard from '../models/keyboardModel';
import Mongoose from 'mongoose';

export const createKeyboards = async (keyboardData: any[]) => {
    try {
        const createdKeyboards = await Keyboard.insertMany(keyboardData);
        return createdKeyboards.map(keyboard => keyboard.id);
    } catch (error) {
        throw new Error('failed to create keyboards' + (error as Error).message);
    }
}
