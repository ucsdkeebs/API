import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/userModel';

interface UserRequest extends Request {
    user?: {
        admin?: boolean;
    };
}

export function requireAdmin(req: UserRequest, res: Response, next: NextFunction) {
    console.log('req.user:', req.appUser)
    if (!req.appUser?.admin) {
        return res.status(403).json({ error: "Admins only" });
    }
    next();
}
  
export default requireAdmin;
  