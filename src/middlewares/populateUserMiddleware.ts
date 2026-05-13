// src/middleware/populateAppUser.ts
import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';

export const populateAppUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userCookie = req.cookies?.USER; 

        if (userCookie) {
            const parsedUser = JSON.parse(userCookie);
            const user = await UserModel.findById(parsedUser._id);
            
            if (user) {
                req.appUser = user;
            }
        }
    } catch (error) {
        console.error('Error populating app user:', error);
    }
    
    next();
};