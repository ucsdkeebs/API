import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseConfig';
import UserModel from '../models/userModel';
  
const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized Login' });
  
    //verifies if it is a valid firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    //check if this is a returning or new user
    const existingUser = await UserModel.findOne({ uid: userId });
    
    // if its a new user send them to a page to fill out their information
    if (!existingUser) {
      return res.status(200).json({ redirect: '/register'});
    }

    req.user = existingUser;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
  
export default verifyToken;
  